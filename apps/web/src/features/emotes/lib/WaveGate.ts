/**
 * Lets one thing through per key in a window, the first at once. A wave uses it
 * twice: on the sender, keyed by the person waved at, and on the receiver,
 * keyed by the person who waved, so the sound plays once per sender.
 */
export class WaveGate {
    private readonly lastAt = new Map<string, number>();

    private readonly windowMs: number;

    constructor(windowMs: number) {
        this.windowMs = windowMs;
    }

    // `now` is a clock in ms. Counts the pass when it is allowed.
    allow(key: string, now: number): boolean {
        const last = this.lastAt.get(key);
        if (last !== undefined && now - last < this.windowMs) return false;

        this.lastAt.set(key, now);
        return true;
    }

    remove(key: string): void {
        this.lastAt.delete(key);
    }

    clear(): void {
        this.lastAt.clear();
    }
}
