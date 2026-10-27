import { describe, expect, it } from "vitest";
import { stabilizeRanking } from "../stabilizeRanking";
import { buildUsage, sumCounts } from "../buildUsage";

describe("stabilizeRanking", () => {
    it("keeps the order while the same people speak, whatever the volume says", () => {
        expect(stabilizeRanking(["a", "b", "c"], ["c", "a", "b"])).toEqual([
            "a",
            "b",
            "c",
        ]);
    });

    it("adds who starts speaking at the end and drops who stops", () => {
        expect(stabilizeRanking(["a", "b"], ["d", "b"])).toEqual(["b", "d"]);
    });

    it("starts from the order of the first report", () => {
        expect(stabilizeRanking([], ["x", "y"])).toEqual(["x", "y"]);
    });

    it("is empty when nobody speaks", () => {
        expect(stabilizeRanking(["a"], [])).toEqual([]);
    });
});

describe("usage", () => {
    it("adds the counts of every room", () => {
        const total = sumCounts([
            { peers: 1, transports: 2, producers: 3, consumers: 4 },
            { peers: 1, transports: 2, producers: 3, consumers: 4 },
        ]);
        expect(total).toEqual({
            peers: 2,
            transports: 4,
            producers: 6,
            consumers: 8,
        });
    });

    it("turns the milliseconds of the worker into seconds", () => {
        const usage = buildUsage(
            1,
            { peers: 0, transports: 0, producers: 0, consumers: 0 },
            { ru_utime: 1500, ru_stime: 500, ru_maxrss: 10 } as never
        );
        expect(usage.workerCpuSeconds).toBe(2);
    });
});
