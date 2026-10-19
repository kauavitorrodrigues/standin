import { AVATAR_BLINK } from "@/features/game/consts/avatar-blink";

/**
 * The clock of one avatar's blinks. Each frame it is asked whether the eyes
 * are closed right now. It only counts while the avatar can blink (standing
 * still), and starts a new wait every time it can not, so an avatar that sits
 * or walks never blinks the instant it stops.
 */
export class AvatarBlink {
    private readonly random: () => number;
    private nextBlinkAt: number | null = null;
    private blinkEndsAt = 0;

    constructor(random: () => number = Math.random) {
        this.random = random;
    }

    // `now` is the scene time in ms. Returns true while the eyes are closed.
    update(now: number, canBlink: boolean): boolean {
        if (!canBlink) {
            this.nextBlinkAt = null;
            this.blinkEndsAt = 0;
            return false;
        }

        if (this.nextBlinkAt === null) this.scheduleFrom(now);
        if (now < this.blinkEndsAt) return true;
        if (this.nextBlinkAt === null || now < this.nextBlinkAt) return false;

        this.blinkEndsAt = now + AVATAR_BLINK.DURATION_MS;
        this.scheduleFrom(this.blinkEndsAt);
        return true;
    }

    private scheduleFrom(from: number): void {
        const { MIN_INTERVAL_MS, MAX_INTERVAL_MS } = AVATAR_BLINK;
        this.nextBlinkAt =
            from +
            MIN_INTERVAL_MS +
            this.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
    }
}
