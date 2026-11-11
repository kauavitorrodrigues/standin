// @vitest-environment jsdom
import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { WALK_EVENTS } from "@/features/game/consts/walk-events";
import { WEBSITE_EVENTS } from "@/features/game/consts/website";
import type { GameEngineHandle } from "@/features/game/types/game";
import { useWebsiteSession } from "../useWebsiteSession";

const createHandle = (walkToWebsite = vi.fn().mockReturnValue(true)) => {
    const events = new EventEmitter();
    const handle = {
        game: { events },
        walkToWebsite,
    } as unknown as GameEngineHandle;
    return { handle, events, walkToWebsite };
};

afterEach(unmountAllHooks);

describe("useWebsiteSession", () => {
    it("keeps the site open while the avatar stays within reach", () => {
        const { handle, events } = createHandle();
        const { result, act } = renderHook(() => useWebsiteSession(handle));
        act(() => events.emit(WEBSITE_EVENTS.IN_REACH_CHANGED, ["a"]));

        act(() => result.current.open("a"));

        expect(result.current.viewingId).toBe("a");
        expect(result.current.inReachIds).toEqual(["a"]);
    });

    it("closes the site when the avatar leaves the reach of the object", () => {
        const { handle, events } = createHandle();
        const { result, act } = renderHook(() => useWebsiteSession(handle));
        act(() => events.emit(WEBSITE_EVENTS.IN_REACH_CHANGED, ["a"]));
        act(() => result.current.open("a"));

        act(() => events.emit(WEBSITE_EVENTS.IN_REACH_CHANGED, []));

        expect(result.current.viewingId).toBeNull();
    });

    it("does not open an object the avatar is not within reach of", () => {
        const { handle } = createHandle();
        const { result, act } = renderHook(() => useWebsiteSession(handle));

        act(() => result.current.open("a"));

        expect(result.current.viewingId).toBeNull();
    });

    it("minimizes and brings the site back without closing it", () => {
        const { handle, events } = createHandle();
        const { result, act } = renderHook(() => useWebsiteSession(handle));
        act(() => events.emit(WEBSITE_EVENTS.IN_REACH_CHANGED, ["a"]));
        act(() => result.current.open("a"));

        act(() => result.current.toggleMinimized());
        expect(result.current.isMinimized).toBe(true);
        expect(result.current.viewingId).toBe("a");

        act(() => result.current.toggleMinimized());
        expect(result.current.isMinimized).toBe(false);
    });

    it("walks to the object and opens it by itself on arriving", () => {
        const { handle, events, walkToWebsite } = createHandle();
        const { result, act } = renderHook(() => useWebsiteSession(handle));

        act(() => result.current.walkTo("a"));
        expect(walkToWebsite).toHaveBeenCalledWith("a");
        expect(result.current.viewingId).toBeNull();

        act(() => events.emit(WEBSITE_EVENTS.IN_REACH_CHANGED, ["a"]));

        expect(result.current.viewingId).toBe("a");
    });

    it("gives up the walk when it ends away from the object", () => {
        const { handle, events } = createHandle();
        const { result, act } = renderHook(() => useWebsiteSession(handle));
        act(() => result.current.walkTo("a"));

        act(() => events.emit(WALK_EVENTS.CHANGED, false));
        act(() => events.emit(WEBSITE_EVENTS.IN_REACH_CHANGED, ["a"]));

        expect(result.current.viewingId).toBeNull();
    });

    it("does not wait for an arrival when the walk cannot be planned", () => {
        const { handle, events } = createHandle(vi.fn().mockReturnValue(false));
        const { result, act } = renderHook(() => useWebsiteSession(handle));

        act(() => result.current.walkTo("a"));
        act(() => events.emit(WEBSITE_EVENTS.IN_REACH_CHANGED, ["a"]));

        expect(result.current.viewingId).toBeNull();
    });
});
