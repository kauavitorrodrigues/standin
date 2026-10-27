import { describe, expect, it } from "vitest";
import {
    nextDemand,
    type DemandBook,
    type DemandEntry,
} from "../producerDemand";

const camera = (consumerCount: number): DemandEntry => ({
    peerId: "a",
    source: "camera",
    consumerCount,
});

describe("nextDemand", () => {
    const IDLE = 3000;

    it("starts as wanted and says nothing while somebody receives the stream", () => {
        const book: DemandBook = new Map();
        expect(nextDemand([camera(1)], book, 0, IDLE)).toEqual([]);
    });

    it("keeps a stream nobody receives for the grace period before stopping it", () => {
        const book: DemandBook = new Map();
        expect(nextDemand([camera(0)], book, 0, IDLE)).toEqual([]);
        expect(nextDemand([camera(0)], book, 2999, IDLE)).toEqual([]);
        expect(nextDemand([camera(0)], book, 3000, IDLE)).toEqual([
            { peerId: "a", source: "camera", wanted: false },
        ]);
    });

    it("says it only once", () => {
        const book: DemandBook = new Map();
        nextDemand([camera(0)], book, 0, IDLE);
        nextDemand([camera(0)], book, 3000, IDLE);
        expect(nextDemand([camera(0)], book, 9000, IDLE)).toEqual([]);
    });

    it("wants the stream again at once when somebody receives it", () => {
        const book: DemandBook = new Map();
        nextDemand([camera(0)], book, 0, IDLE);
        nextDemand([camera(0)], book, 3000, IDLE);
        expect(nextDemand([camera(1)], book, 3100, IDLE)).toEqual([
            { peerId: "a", source: "camera", wanted: true },
        ]);
    });

    it("does not stop a stream that was received again inside the grace period", () => {
        const book: DemandBook = new Map();
        nextDemand([camera(0)], book, 0, IDLE);
        nextDemand([camera(1)], book, 2000, IDLE);
        expect(nextDemand([camera(0)], book, 4000, IDLE)).toEqual([]);
        expect(nextDemand([camera(0)], book, 7000, IDLE)).toEqual([
            { peerId: "a", source: "camera", wanted: false },
        ]);
    });

    it("forgets a stream that stopped existing", () => {
        const book: DemandBook = new Map();
        nextDemand([camera(0)], book, 0, IDLE);
        nextDemand([], book, 100, IDLE);
        expect(book.size).toBe(0);
    });
});
