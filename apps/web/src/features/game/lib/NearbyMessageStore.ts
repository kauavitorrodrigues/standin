import {
    NEARBY_CONTEXTS,
    NEARBY_TYPING_EXPIRY_MS,
    type NearbyContextName,
} from "@/features/game/consts/nearby";
import type {
    NearbyBubbleLine,
    NearbyMessage,
    NearbySnapshot,
} from "@/features/game/types/nearby";
import { getNearbyOpacity } from "@/features/game/utils/getNearbyOpacity";

type Options = {
    // Where the history is kept between visits. Null keeps it in memory only.
    storageKey: string | null;
    // The clock, injected so a test can move it.
    now?: () => number;
};

const CONTEXT_NAMES = Object.keys(NEARBY_CONTEXTS) as NearbyContextName[];

const isStoredMessage = (value: unknown): value is NearbyMessage => {
    if (typeof value !== "object" || value === null) return false;

    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.id === "string" &&
        typeof candidate.senderId === "string" &&
        typeof candidate.text === "string" &&
        typeof candidate.at === "number" &&
        Number.isFinite(candidate.at)
    );
};

/**
 * The messages sent to whoever is nearby, in the three places they live: over
 * the avatar (`MAP`), on the strip over the control bar (`STRIP`) and in the
 * list of the panel (`HISTORY`). Each place has its own timeout and its own
 * ceiling, as in Gather. It also knows who is typing. No React and no Phaser,
 * so it runs with fake timers, and the views read it through `subscribe` and
 * `getSnapshot`.
 */
export class NearbyMessageStore {
    private readonly storageKey: string | null;
    private readonly now: () => number;
    private readonly lists: Record<NearbyContextName, NearbyMessage[]> = {
        MAP: [],
        STRIP: [],
        HISTORY: [],
    };
    private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
    private readonly typingTimers = new Map<
        string,
        ReturnType<typeof setTimeout>
    >();
    private readonly listeners = new Set<() => void>();
    private nextId = 0;
    private snapshot: NearbySnapshot = {
        history: [],
        strip: [],
        typingUserIds: new Set(),
    };

    constructor({ storageKey, now = () => Date.now() }: Options) {
        this.storageKey = storageKey;
        this.now = now;
        this.restoreHistory();
        this.refreshSnapshot();
    }

    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = (): NearbySnapshot => this.snapshot;

    // The message goes to the map and to the history, and to the strip only when
    // it is from someone else. The time is the local clock.
    add(senderId: string, text: string, { isMine }: { isMine: boolean }): void {
        const message: NearbyMessage = {
            id: `${this.now()}-${this.nextId++}`,
            senderId,
            text,
            at: this.now(),
        };

        this.insert("MAP", message);
        this.insert("HISTORY", message);
        if (!isMine) this.insert("STRIP", message);

        this.clearTypingTimer(senderId);
        this.persistHistory();
        this.refreshSnapshot();
    }

    // The active messages of a person over the avatar, newest first, with the
    // opacity of each in the stack.
    getForMap(userId: string): NearbyBubbleLine[] {
        const own = this.lists.MAP.filter(
            (message) => message.senderId === userId
        );

        return own
            .map((message, index) => ({
                message,
                opacity: getNearbyOpacity(index, own.length),
            }))
            .reverse();
    }

    // The ids of everyone with a message over the avatar.
    getBubbleUserIds(): Set<string> {
        return new Set(this.lists.MAP.map((message) => message.senderId));
    }

    isTyping(userId: string): boolean {
        return this.snapshot.typingUserIds.has(userId);
    }

    setTyping(userId: string, isTyping: boolean): void {
        this.clearTypingTimer(userId);
        if (isTyping) {
            this.typingTimers.set(
                userId,
                setTimeout(() => {
                    this.typingTimers.delete(userId);
                    this.refreshSnapshot();
                }, NEARBY_TYPING_EXPIRY_MS)
            );
        }
        this.refreshSnapshot();
    }

    // Drops what has expired. Timers are late in a tab in the background, so
    // this runs when the tab comes back.
    cleanupExpired(now: number = this.now()): void {
        let changed = false;
        CONTEXT_NAMES.forEach((name) => {
            const { timeoutMs } = NEARBY_CONTEXTS[name];
            const expired = this.lists[name].filter(
                (message) => now - message.at >= timeoutMs
            );
            expired.forEach((message) => this.remove(name, message));
            if (expired.length > 0) changed = true;
        });

        if (!changed) return;
        this.persistHistory();
        this.refreshSnapshot();
    }

    // Stops every timer and drops the listeners. The messages stay, so the store
    // can start again with `restart`, which React needs when it mounts an
    // effect twice.
    destroy(): void {
        this.stopTimers();
        this.listeners.clear();
    }

    // Arms the timers again for the messages that are still there, each one for
    // what is left of its time.
    restart(): void {
        this.stopTimers();
        const now = this.now();
        CONTEXT_NAMES.forEach((name) => {
            const { timeoutMs } = NEARBY_CONTEXTS[name];
            this.lists[name].forEach((message) =>
                this.startTimer(name, message, timeoutMs - (now - message.at))
            );
        });
    }

    private stopTimers(): void {
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers.clear();
        this.typingTimers.forEach((timer) => clearTimeout(timer));
        this.typingTimers.clear();
    }

    private insert(name: NearbyContextName, message: NearbyMessage): void {
        const { timeoutMs, maxCount } = NEARBY_CONTEXTS[name];
        const list = this.lists[name];
        list.push(message);

        // MAP is counted per person, the other two as a whole.
        const sameGroup = (other: NearbyMessage): boolean =>
            name !== "MAP" || other.senderId === message.senderId;
        const group = list.filter(sameGroup);
        group
            .slice(0, Math.max(group.length - maxCount, 0))
            .forEach((old) => this.remove(name, old));

        this.startTimer(name, message, timeoutMs - (this.now() - message.at));
    }

    private startTimer(
        name: NearbyContextName,
        message: NearbyMessage,
        delayMs: number
    ): void {
        this.timers.set(
            this.getTimerKey(name, message),
            setTimeout(
                () => {
                    this.remove(name, message);
                    this.persistHistory();
                    this.refreshSnapshot();
                },
                Math.max(delayMs, 0)
            )
        );
    }

    private remove(name: NearbyContextName, message: NearbyMessage): void {
        this.lists[name] = this.lists[name].filter(
            (other) => other.id !== message.id
        );

        const key = this.getTimerKey(name, message);
        const timer = this.timers.get(key);
        if (timer !== undefined) clearTimeout(timer);
        this.timers.delete(key);
    }

    private getTimerKey(
        name: NearbyContextName,
        message: NearbyMessage
    ): string {
        return `${name}:${message.id}`;
    }

    private clearTypingTimer(userId: string): void {
        const timer = this.typingTimers.get(userId);
        if (timer === undefined) return;

        clearTimeout(timer);
        this.typingTimers.delete(userId);
    }

    private refreshSnapshot(): void {
        this.snapshot = {
            history: [...this.lists.HISTORY],
            strip: [...this.lists.STRIP],
            typingUserIds: new Set(this.typingTimers.keys()),
        };
        this.listeners.forEach((listener) => listener());
    }

    private restoreHistory(): void {
        const stored = this.readStorage();
        if (!stored) return;

        const { timeoutMs, maxCount } = NEARBY_CONTEXTS.HISTORY;
        const now = this.now();
        stored
            .filter((message) => now - message.at < timeoutMs)
            .slice(-maxCount)
            .forEach((message) => {
                this.lists.HISTORY.push(message);
                this.startTimer(
                    "HISTORY",
                    message,
                    timeoutMs - (now - message.at)
                );
            });
    }

    private readStorage(): NearbyMessage[] | null {
        if (this.storageKey === null) return null;

        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw === null) return null;

            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) return null;

            return parsed.filter(isStoredMessage);
        } catch {
            return null;
        }
    }

    private persistHistory(): void {
        if (this.storageKey === null) return;

        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.lists.HISTORY)
            );
        } catch {
            // Storage can be blocked or full. The history just stays in memory.
        }
    }
}
