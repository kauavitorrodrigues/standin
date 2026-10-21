import { NEARBY_TYPING_THROTTLE_MS } from "@/features/game/consts/nearby";

/**
 * Tells the peers that the person is typing. The first change goes out at
 * once, the next ones at most once a second with the last word (a trailing
 * send), and stopping sends `false` only if `true` had gone out. No React, so
 * it runs with fake timers.
 */
export class NearbyTypingNotifier {
    private readonly send: (isTyping: boolean) => void;
    private lastSentAt = Number.NEGATIVE_INFINITY;
    private isSent = false;
    private timer: ReturnType<typeof setTimeout> | null = null;

    constructor(send: (isTyping: boolean) => void) {
        this.send = send;
    }

    // The text changed, or the field got focus with text in it.
    typing(): void {
        if (this.timer !== null) return;

        const wait = this.lastSentAt + NEARBY_TYPING_THROTTLE_MS - Date.now();
        if (wait <= 0) {
            this.emit();
            return;
        }

        this.timer = setTimeout(() => {
            this.timer = null;
            this.emit();
        }, wait);
    }

    // The field lost the focus, was emptied or the message went out.
    stop(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (!this.isSent) return;

        this.isSent = false;
        this.lastSentAt = Number.NEGATIVE_INFINITY;
        this.send(false);
    }

    private emit(): void {
        this.isSent = true;
        this.lastSentAt = Date.now();
        this.send(true);
    }
}
