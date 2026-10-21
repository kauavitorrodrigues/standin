import {
    EMOTE_COMBO_MAX,
    EMOTE_COMBO_MIN,
    EMOTE_COMBO_WINDOW_MS,
    type PeerEmotePayload,
} from "@standin/contracts";

/**
 * Groups the clicks of the reactions. Clicks in the same emoji inside the
 * combo window become one event with a count, up to the limit of a combo. A
 * different emoji closes the group before it. No React and no Phaser, so it
 * runs with fake timers.
 */
export class EmoteSender {
    private readonly dispatch: (payload: PeerEmotePayload) => void;
    private group: PeerEmotePayload | null = null;
    private timer: ReturnType<typeof setTimeout> | null = null;

    constructor(dispatch: (payload: PeerEmotePayload) => void) {
        this.dispatch = dispatch;
    }

    send(emoji: string): void {
        this.clearTimer();

        if (this.group && this.isClosedBy(this.group, emoji)) this.flush();

        this.group = {
            emoji,
            count: this.group ? this.group.count + 1 : EMOTE_COMBO_MIN,
        };
        this.timer = setTimeout(() => {
            this.timer = null;
            this.flush();
        }, EMOTE_COMBO_WINDOW_MS);
    }

    // Drops the group waiting, without sending it.
    destroy(): void {
        this.clearTimer();
        this.group = null;
    }

    // A group is over when another emoji comes or when it is full.
    private isClosedBy(group: PeerEmotePayload, emoji: string): boolean {
        return group.emoji !== emoji || group.count >= EMOTE_COMBO_MAX;
    }

    private flush(): void {
        if (!this.group) return;

        const payload = this.group;
        this.group = null;
        this.dispatch(payload);
    }

    private clearTimer(): void {
        if (this.timer === null) return;

        clearTimeout(this.timer);
        this.timer = null;
    }
}
