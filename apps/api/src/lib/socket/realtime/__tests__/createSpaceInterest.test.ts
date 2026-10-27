import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS, type PlayerPosition } from "@standin/contracts";
import { createSpaceInterest } from "../createSpaceInterest";

const at = (x: number, y: number): PlayerPosition => ({
    x,
    y,
    direction: PLAYER_DIRECTIONS.DOWN,
    isSitting: false,
});

const build = () => createSpaceInterest({ radius: 100, exitMargin: 20 });

const ids = (tuples: unknown[][] | undefined) =>
    (tuples ?? []).map((tuple) => tuple[0]).sort();

const socketsOf = (tuples: unknown[][] | undefined) =>
    (tuples ?? []).map((tuple) => tuple[4]).sort();

// What a client learns from `entered`: which short id is which socket.
const learn = (
    interest: ReturnType<typeof build>,
    receiver: string,
    other: string
) => {
    const result = interest.flush();
    return result.get(receiver)?.entered.find((tuple) => tuple[4] === other)?.[0];
};

describe("createSpaceInterest", () => {
    it("tells two people near each other about one another as entered", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));

        const result = interest.flush();

        expect(socketsOf(result.get("a")?.entered)).toEqual(["b"]);
        expect(socketsOf(result.get("b")?.entered)).toEqual(["a"]);
        expect(result.get("a")?.moved).toEqual([]);
    });

    it("tells nothing about people past the radius", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(500, 0));

        expect(interest.flush().size).toBe(0);
    });

    it("sends only what moved to someone who already knows the mover", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        const bId = learn(interest, "a", "b");

        interest.update("b", at(60, 0));
        const result = interest.flush();

        expect(ids(result.get("a")?.moved)).toEqual([bId]);
        expect(result.get("a")?.entered).toEqual([]);
        // The mover hears nothing about themselves, and a stays put.
        expect(result.has("b")).toBe(false);
    });

    it("sends nothing at all when nobody moved", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        interest.flush();

        expect(interest.hasPending()).toBe(false);
        expect(interest.flush().size).toBe(0);
    });

    it("tells who walked out of sight as left, and back in as entered", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        const bId = learn(interest, "a", "b");

        interest.update("b", at(300, 0));
        const gone = interest.flush();
        expect(gone.get("a")?.left).toEqual([bId]);
        expect(gone.get("b")?.left).toHaveLength(1);

        interest.update("b", at(60, 0));
        const back = interest.flush();
        expect(socketsOf(back.get("a")?.entered)).toEqual(["b"]);
    });

    it("keeps someone known inside the exit margin so the border does not flicker", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(90, 0));
        const bId = learn(interest, "a", "b");

        interest.update("b", at(110, 0));
        const result = interest.flush();

        expect(ids(result.get("a")?.moved)).toEqual([bId]);
        expect(result.get("a")?.left).toEqual([]);
    });

    it("does not tell about someone in the margin who was never known", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(110, 0));

        expect(interest.flush().size).toBe(0);
    });

    it("tells who left the space even if nobody moved", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        const bId = learn(interest, "a", "b");

        interest.remove("b");
        const result = interest.flush();

        expect(result.get("a")?.left).toEqual([bId]);
        expect(interest.neighbors("a", 500)).toEqual([]);
    });

    it("gives the full state of who comes in, not only who moved", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(300, 0));
        interest.flush();

        // a walks next to b, who is standing still.
        interest.update("a", at(250, 0));
        const result = interest.flush();

        const entered = result.get("a")?.entered ?? [];
        expect(entered).toHaveLength(1);
        expect(entered[0].slice(1, 3)).toEqual([300, 0]);
        expect(entered[0][4]).toBe("b");
    });

    it("sends nothing for a position that did not change", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        interest.flush();

        interest.update("b", at(50, 0));

        expect(interest.hasPending()).toBe(false);
        expect(interest.flush().size).toBe(0);
    });

    it("sends a change of direction or sitting even at the same spot", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        interest.flush();

        interest.update("b", { ...at(50, 0), isSitting: true });

        expect(interest.flush().get("a")?.moved).toHaveLength(1);
    });

    it("gives each person a different short id and keeps it while they stay", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        interest.update("c", at(60, 0));
        const first = interest.flush().get("a")?.entered ?? [];

        expect(new Set(first.map((tuple) => tuple[0])).size).toBe(2);

        interest.update("c", at(70, 0));
        const moved = interest.flush().get("a")?.moved ?? [];
        const cId = first.find((tuple) => tuple[4] === "c")?.[0];
        expect(moved.map((tuple) => tuple[0])).toEqual([cId]);
    });

    it("never gives a short id of someone who left to someone new", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        const bId = learn(interest, "a", "b");

        interest.remove("b");
        interest.flush();
        interest.update("c", at(50, 0));
        const cId = learn(interest, "a", "c");

        expect(cId).not.toBe(bId);
    });

    it("lists the sockets near a person for the discrete events", () => {
        const interest = build();
        interest.update("a", at(0, 0));
        interest.update("b", at(50, 0));
        interest.update("c", at(900, 0));

        expect(interest.neighbors("a", 100)).toEqual(["b"]);
        expect(interest.neighbors("nobody", 100)).toEqual([]);
    });
});
