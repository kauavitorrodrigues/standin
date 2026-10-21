import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    NEARBY_CONTEXTS,
    NEARBY_TYPING_EXPIRY_MS,
} from "@/features/game/consts/nearby";
import { NearbyMessageStore } from "../NearbyMessageStore";

const KEY = "nearby-history:space:me";

const createMemoryStorage = (): Storage => {
    const data = new Map<string, string>();
    return {
        get length() {
            return data.size;
        },
        clear: () => data.clear(),
        getItem: (key) => data.get(key) ?? null,
        key: (index) => [...data.keys()][index] ?? null,
        removeItem: (key) => void data.delete(key),
        setItem: (key, value) => void data.set(key, String(value)),
    };
};

const createStore = (storageKey: string | null = null) =>
    new NearbyMessageStore({ storageKey });

describe("NearbyMessageStore", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal("localStorage", createMemoryStorage());
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("keeps at most 3 messages per person over the map", () => {
        const store = createStore();
        ["a", "b", "c", "d"].forEach((text) =>
            store.add("u1", text, { isMine: false })
        );
        store.add("u2", "x", { isMine: false });

        expect(store.getForMap("u1").map((line) => line.message.text)).toEqual([
            "d",
            "c",
            "b",
        ]);
        expect(store.getForMap("u2")).toHaveLength(1);
    });

    it("keeps at most 5 messages in the history and the strip", () => {
        const store = createStore();
        for (let index = 0; index < 7; index += 1) {
            store.add("u1", `m${index}`, { isMine: false });
        }

        const { history, strip } = store.getSnapshot();
        expect(history.map((message) => message.text)).toEqual([
            "m2",
            "m3",
            "m4",
            "m5",
            "m6",
        ]);
        expect(strip).toHaveLength(5);
    });

    it("expires each place on its own timeout", () => {
        const store = createStore();
        store.add("u1", "hi", { isMine: false });

        vi.advanceTimersByTime(NEARBY_CONTEXTS.MAP.timeoutMs);
        expect(store.getForMap("u1")).toHaveLength(0);
        expect(store.getSnapshot().strip).toHaveLength(1);

        vi.advanceTimersByTime(
            NEARBY_CONTEXTS.STRIP.timeoutMs - NEARBY_CONTEXTS.MAP.timeoutMs
        );
        expect(store.getSnapshot().strip).toHaveLength(0);
        expect(store.getSnapshot().history).toHaveLength(1);

        vi.advanceTimersByTime(NEARBY_CONTEXTS.HISTORY.timeoutMs);
        expect(store.getSnapshot().history).toHaveLength(0);
    });

    it("cleans what expired after the clock jumps", () => {
        let now = 1000;
        const store = new NearbyMessageStore({
            storageKey: null,
            now: () => now,
        });
        store.add("u1", "hi", { isMine: false });

        now += NEARBY_CONTEXTS.STRIP.timeoutMs + 1;
        store.cleanupExpired();

        expect(store.getForMap("u1")).toHaveLength(0);
        expect(store.getSnapshot().strip).toHaveLength(0);
        expect(store.getSnapshot().history).toHaveLength(1);
    });

    it("leaves my messages out of the strip", () => {
        const store = createStore();
        store.add("me", "mine", { isMine: true });

        expect(store.getSnapshot().strip).toHaveLength(0);
        expect(store.getSnapshot().history).toHaveLength(1);
        expect(store.getForMap("me")).toHaveLength(1);
    });

    it("gives the stack the opacity from the oldest to the newest", () => {
        const store = createStore();
        store.add("u1", "a", { isMine: false });
        store.add("u1", "b", { isMine: false });

        expect(store.getForMap("u1").map((line) => line.opacity)).toEqual([
            1, 0.4,
        ]);
    });

    it("notifies the listeners and gives a new snapshot per change", () => {
        const store = createStore();
        const listener = vi.fn();
        store.subscribe(listener);
        const before = store.getSnapshot();

        store.add("u1", "hi", { isMine: false });

        expect(listener).toHaveBeenCalled();
        expect(store.getSnapshot()).not.toBe(before);
    });

    describe("typing", () => {
        it("expires after 3 seconds without a new event", () => {
            const store = createStore();
            store.setTyping("u1", true);
            expect(store.isTyping("u1")).toBe(true);

            vi.advanceTimersByTime(NEARBY_TYPING_EXPIRY_MS - 1);
            expect(store.isTyping("u1")).toBe(true);

            vi.advanceTimersByTime(1);
            expect(store.isTyping("u1")).toBe(false);
        });

        it("renews the expiry on a new event and stops on false", () => {
            const store = createStore();
            store.setTyping("u1", true);
            vi.advanceTimersByTime(NEARBY_TYPING_EXPIRY_MS - 1);
            store.setTyping("u1", true);
            vi.advanceTimersByTime(NEARBY_TYPING_EXPIRY_MS - 1);
            expect(store.isTyping("u1")).toBe(true);

            store.setTyping("u1", false);
            expect(store.isTyping("u1")).toBe(false);
        });

        it("stops when the message arrives", () => {
            const store = createStore();
            store.setTyping("u1", true);
            store.add("u1", "hi", { isMine: false });

            expect(store.isTyping("u1")).toBe(false);
        });
    });

    describe("persistence", () => {
        it("saves the history and restores it", () => {
            createStore(KEY).add("me", "hello", { isMine: true });

            const restored = createStore(KEY);
            expect(
                restored.getSnapshot().history.map((message) => message.text)
            ).toEqual(["hello"]);
            expect(restored.getSnapshot().strip).toHaveLength(0);
        });

        it("cuts what is older than 5 minutes when restoring", () => {
            createStore(KEY).add("me", "old", { isMine: true });
            vi.setSystemTime(Date.now() + NEARBY_CONTEXTS.HISTORY.timeoutMs);

            expect(createStore(KEY).getSnapshot().history).toHaveLength(0);
        });

        it("expires a restored message at its original time", () => {
            createStore(KEY).add("me", "kept", { isMine: true });
            vi.advanceTimersByTime(NEARBY_CONTEXTS.HISTORY.timeoutMs - 1000);

            const restored = createStore(KEY);
            expect(restored.getSnapshot().history).toHaveLength(1);

            vi.advanceTimersByTime(1000);
            expect(restored.getSnapshot().history).toHaveLength(0);
        });

        it("discards a storage with the wrong format", () => {
            localStorage.setItem(KEY, "not json");
            expect(createStore(KEY).getSnapshot().history).toEqual([]);

            localStorage.setItem(KEY, JSON.stringify({ a: 1 }));
            expect(createStore(KEY).getSnapshot().history).toEqual([]);

            localStorage.setItem(KEY, JSON.stringify([{ id: 1 }, null, "x"]));
            expect(createStore(KEY).getSnapshot().history).toEqual([]);
        });

        it("survives a storage that throws", () => {
            vi.spyOn(localStorage, "getItem").mockImplementation(() => {
                throw new Error("blocked");
            });
            vi.spyOn(localStorage, "setItem").mockImplementation(() => {
                throw new DOMException("full", "QuotaExceededError");
            });

            const store = createStore(KEY);
            expect(() =>
                store.add("me", "hello", { isMine: true })
            ).not.toThrow();
            expect(store.getSnapshot().history).toHaveLength(1);
        });
    });

    it("clears every timer when destroyed", () => {
        const store = createStore();
        store.add("u1", "hi", { isMine: false });
        store.setTyping("u1", true);

        store.destroy();

        expect(vi.getTimerCount()).toBe(0);
    });

    it("starts again after being destroyed, for what is left of the time", () => {
        const store = createStore();
        store.add("u1", "hi", { isMine: false });
        vi.advanceTimersByTime(2000);

        store.destroy();
        store.restart();

        vi.advanceTimersByTime(NEARBY_CONTEXTS.MAP.timeoutMs - 2000);
        expect(store.getForMap("u1")).toHaveLength(0);
        expect(store.getSnapshot().history).toHaveLength(1);
    });
});
