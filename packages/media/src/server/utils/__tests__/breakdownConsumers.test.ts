import { describe, expect, it } from "vitest";
import type { ConsumerEntry, Peer } from "../../spaceTypes";
import { breakdownConsumers } from "../breakdownConsumers";

const entry = (overrides: Partial<ConsumerEntry>): ConsumerEntry =>
    ({
        ownerId: "x",
        producerId: "p",
        kind: "video",
        layer: "low",
        paused: false,
        ready: true,
        ...overrides,
    }) as ConsumerEntry;

const peerWith = (...entries: ConsumerEntry[]): Peer =>
    ({
        consumers: new Map(entries.map((item, index) => [`c${index}`, item])),
    }) as unknown as Peer;

describe("breakdownConsumers", () => {
    it("counts audio, each video layer and screens apart", () => {
        const peers = new Map([
            [
                "a",
                peerWith(
                    entry({ kind: "audio", layer: null }),
                    entry({ layer: "low" }),
                    entry({ layer: "mid" }),
                    entry({ layer: "high" }),
                    entry({ layer: null })
                ),
            ],
        ]);

        expect(breakdownConsumers(peers)).toEqual({
            audio: 1,
            videoLow: 1,
            videoMid: 1,
            videoHigh: 1,
            screen: 1,
            paused: 0,
        });
    });

    it("counts a paused consumer in its kind and in paused", () => {
        const peers = new Map([
            ["a", peerWith(entry({ layer: "low", paused: true }))],
        ]);

        const result = breakdownConsumers(peers);

        expect(result.videoLow).toBe(1);
        expect(result.paused).toBe(1);
    });

    it("is empty for a room without consumers", () => {
        expect(breakdownConsumers(new Map()).audio).toBe(0);
    });
});
