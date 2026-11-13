import { describe, expect, it } from "vitest";
import { planSubscriptions } from "../planSubscriptions";
import { DEFAULT_AMBIENT_RULES, allowsAmbient } from "../magnitudeRules";
import { ambientRadii } from "../utils/ambientRadii";
import type {
    AmbientRule,
    CurrentConsumer,
    PersonState,
    PlanInput,
} from "../types";

const person = (id: string, extra: Partial<PersonState> = {}): PersonState => ({
    id,
    roomKey: null,
    muted: false,
    headphones: false,
    away: false,
    focusMode: false,
    announcing: false,
    sharingVideoWithAnnouncer: false,
    producers: { audio: `${id}:audio` },
    ...extra,
});

// Tiles are 32 px. The Short preset ends at 5 tiles (160 px), the short
// ambient ring at 9 tiles (288 px), the long one at 15 tiles (480 px).
const tile = (tiles: number) => ({ x: tiles * 32, y: 0 });

const plan = (
    others: Record<string, number>,
    config: PlanInput["config"],
    people: PersonState[] = Object.keys(others).map((id) => person(id)),
    current: CurrentConsumer[] = [],
    // Everybody speaks unless a test says who does.
    speakers: string[] = Object.keys(others)
) => {
    const spots: Record<string, { x: number; y: number }> = {
        me: { x: 0, y: 0 },
    };
    Object.entries(others).forEach(([id, tiles]) => {
        spots[id] = tile(tiles);
    });
    const result = planSubscriptions({
        now: 10_000,
        positions: { get: (id) => spots[id] },
        people: [person("me"), ...people],
        speakers,
        dirtyIds: new Set(["me"]),
        current: new Map([["me", current]]),
        lastChangeAt: new Map(),
        config,
    });
    return result.plans[0]!;
};

const SHORT_RING = { preset: "Short", ambientRange: "short" } as const;

describe("ambient ring", () => {
    it("hears nobody beyond the proximity ring when the range is off", () => {
        const result = plan({ a: 6 }, { preset: "Short", ambientRange: "off" });

        expect(result.desired).toEqual([]);
    });

    it("overhears a person in the ring as an ambient audio consumer", () => {
        const result = plan({ a: 6 }, SHORT_RING);

        expect(result.desired).toMatchObject([
            { personId: "a", kind: "audio", connection: "ambient" },
        ]);
    });

    it("keeps a person inside the proximity ring strong", () => {
        const result = plan({ a: 3 }, SHORT_RING);

        expect(result.desired).toMatchObject([{ connection: "strong" }]);
    });

    it("drops a person beyond the outer edge of the ring", () => {
        expect(plan({ a: 10 }, SHORT_RING).desired).toEqual([]);
    });

    it("reaches further with the long range", () => {
        const long = { preset: "Short", ambientRange: "long" } as const;

        expect(plan({ a: 12 }, long).desired).toHaveLength(1);
        expect(plan({ a: 12 }, SHORT_RING).desired).toEqual([]);
    });

    it("never gives video from the ring", () => {
        const people = [person("a", { producers: { camera: "a:camera" } })];

        expect(plan({ a: 6 }, SHORT_RING, people).desired).toEqual([]);
    });

    it("keeps a person already overheard until the exit radius", () => {
        const { enterRadius } = ambientRadii("Short", "short");
        const held: CurrentConsumer = {
            personId: "a",
            producerId: "a:audio",
            kind: "audio",
            layer: null,
            paused: false,
        };
        const spots = { a: (enterRadius + 10) / 32 };

        expect(plan(spots, SHORT_RING).desired).toEqual([]);
        expect(plan(spots, SHORT_RING, undefined, [held]).desired).toHaveLength(
            1
        );
    });

    it("overhears only as many voices as the limit", () => {
        const result = plan(
            { a: 6, b: 6.5, c: 7, d: 7.5 },
            { ...SHORT_RING, ambientListeners: 2 }
        );

        expect(result.desired.map((consumer) => consumer.personId)).toEqual([
            "a",
            "b",
        ]);
    });

    it("gives a new slot only to somebody who is speaking", () => {
        const result = plan({ a: 6, b: 6.5 }, SHORT_RING, undefined, [], ["b"]);

        expect(result.desired.map((consumer) => consumer.personId)).toEqual([
            "b",
        ]);
    });

    it("ranks the speakers before the nearer people", () => {
        const result = plan(
            { a: 6, b: 7, c: 8 },
            { ...SHORT_RING, ambientListeners: 1 },
            undefined,
            [],
            ["c"]
        );

        expect(result.desired.map((consumer) => consumer.personId)).toEqual([
            "c",
        ]);
    });

    it("lets a person who holds a slot keep it through a pause", () => {
        const held: CurrentConsumer = {
            personId: "a",
            producerId: "a:audio",
            kind: "audio",
            layer: null,
            paused: false,
        };
        const result = plan({ a: 6 }, SHORT_RING, undefined, [held], []);

        expect(result.desired).toHaveLength(1);
        expect(result.create).toEqual([]);
    });

    it("skips a muted person", () => {
        const people = [person("a", { muted: true })];

        expect(plan({ a: 6 }, SHORT_RING, people).desired).toEqual([]);
    });

    it("is cut by the magnitude rules, like headphones and private rooms", () => {
        const headphones = [person("a", { headphones: true })];
        const room = [person("a", { roomKey: "room-1" })];

        expect(plan({ a: 6 }, SHORT_RING, headphones).desired).toEqual([]);
        expect(plan({ a: 6 }, SHORT_RING, room).desired).toEqual([]);
    });

    it("is dropped for a person in focus mode", () => {
        const people = [person("a", { focusMode: true })];

        expect(plan({ a: 6 }, SHORT_RING, people).desired).toEqual([]);
    });

    it("lets another feature veto a pair through an ambient rule", () => {
        const noA: AmbientRule = (_receiver, other) => other.id !== "a";
        const result = plan(
            { a: 6, b: 6 },
            { ...SHORT_RING, ambientRules: [noA] }
        );

        expect(result.desired.map((consumer) => consumer.personId)).toEqual([
            "b",
        ]);
    });

    it("plans a close of the ambient voice when the person walks away", () => {
        const held: CurrentConsumer = {
            personId: "a",
            producerId: "a:audio",
            kind: "audio",
            layer: null,
            paused: false,
        };
        const result = plan({ a: 20 }, SHORT_RING, undefined, [held]);

        expect(result.close).toEqual([held]);
    });
});

describe("allowsAmbient", () => {
    it("keeps a pair when every rule keeps it", () => {
        expect(
            allowsAmbient(DEFAULT_AMBIENT_RULES, person("a"), person("b"))
        ).toBe(true);
    });

    it("drops the pair when a rule drops it", () => {
        expect(
            allowsAmbient([() => true, () => false], person("a"), person("b"))
        ).toBe(false);
    });
});

describe("ambientRadii", () => {
    it("is 0 when the range is off", () => {
        expect(ambientRadii("Long", "off")).toEqual({
            enterRadius: 0,
            exitRadius: 0,
        });
    });

    it("ends at the outer edge of the ring, with the exit margin", () => {
        expect(ambientRadii("Short", "short")).toEqual({
            enterRadius: 288,
            exitRadius: 318,
        });
    });
});
