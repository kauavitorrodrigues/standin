import { describe, expect, it } from "vitest";
import { planSubscriptions } from "../planSubscriptions";
import { expandDirtySet } from "../expandDirtySet";
import type {
    CurrentConsumer,
    MagnitudeRule,
    PersonState,
    ProducerKind,
} from "../types";

type Spot = { x: number; y: number };

const person = (
    id: string,
    kinds: ProducerKind[] = ["audio"],
    roomKey: string | null = null
): PersonState => ({
    id,
    roomKey,
    producers: Object.fromEntries(kinds.map((kind) => [kind, `${id}:${kind}`])),
});

const held = (
    personId: string,
    kind: ProducerKind,
    extra: Partial<CurrentConsumer> = {}
): CurrentConsumer => ({
    personId,
    producerId: `${personId}:${kind}`,
    kind,
    layer: kind === "camera" ? "low" : null,
    paused: false,
    ...extra,
});

const plan = (
    spots: Record<string, Spot>,
    people: PersonState[],
    extra: Partial<Parameters<typeof planSubscriptions>[0]> = {}
) => {
    const result = planSubscriptions({
        now: 10_000,
        positions: { get: (id) => spots[id] },
        people,
        speakers: [],
        dirtyIds: new Set(["me"]),
        current: new Map(),
        lastChangeAt: new Map(),
        ...extra,
    });
    return result.plans[0]!;
};

const at = (x: number): Spot => ({ x, y: 0 });
const ids = (list: { producerId: string }[]) => list.map((c) => c.producerId);

describe("planSubscriptions hysteresis", () => {
    const spots = { me: at(0), ann: at(135) };
    const people = [person("me", []), person("ann")];

    it("does not pick up someone between the enter and exit radius", () => {
        expect(plan(spots, people).create).toEqual([]);
    });

    it("keeps someone already consumed until the exit radius", () => {
        const result = plan(spots, people, {
            current: new Map([["me", [held("ann", "audio")]]]),
        });
        expect(result.changed).toBe(false);
        expect(ids(result.desired)).toEqual(["ann:audio"]);
    });

    it("drops someone beyond the exit radius", () => {
        const far = { me: at(0), ann: at(151) };
        const result = plan(far, people, {
            current: new Map([["me", [held("ann", "audio")]]]),
        });
        expect(ids(result.close)).toEqual(["ann:audio"]);
    });

    it("does not flip while oscillating around the boundary", () => {
        let consumers: CurrentConsumer[] = [];
        const flips: boolean[] = [];
        [115, 125, 140, 148, 125, 119, 149, 130].forEach((x) => {
            const result = plan({ me: at(0), ann: at(x) }, people, {
                current: new Map([["me", consumers]]),
            });
            flips.push(result.changed);
            consumers = result.desired.map((d) => ({ ...d }));
        });
        expect(flips.filter(Boolean)).toHaveLength(1);
    });
});

describe("planSubscriptions audio", () => {
    const names = ["a", "b", "c", "d", "e", "f"];
    const spots: Record<string, Spot> = { me: at(0) };
    names.forEach((name, index) => {
        spots[name] = at(20 + index * 10);
    });
    const people = [person("me", []), ...names.map((name) => person(name))];

    it("falls back to the nearest K when nobody speaks", () => {
        const result = plan(spots, people);
        expect(ids(result.create)).toEqual([
            "a:audio",
            "b:audio",
            "c:audio",
            "d:audio",
        ]);
    });

    it("prefers the loudest over the nearest, capped at K", () => {
        const result = plan(spots, people, { speakers: ["f", "e"] });
        expect(ids(result.create)).toEqual([
            "a:audio",
            "b:audio",
            "e:audio",
            "f:audio",
        ]);
    });

    it("never gives audio to the receiver itself", () => {
        const result = plan(spots, people);
        expect(ids(result.desired)).not.toContain("me:audio");
    });
});

describe("planSubscriptions video", () => {
    it("gives screens priority in the video slots", () => {
        const spots = { me: at(0), a: at(10), b: at(20), c: at(30) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("b", ["camera"]),
            person("c", ["camera", "screen", "screen-audio"]),
        ];
        const result = plan(spots, people);
        expect(ids(result.create)).toEqual([
            "a:camera",
            "c:screen",
            "c:screen-audio",
        ]);
    });

    it("treats a camera and a screen of one person as two entries", () => {
        const spots = { me: at(0), a: at(10), b: at(20) };
        const people = [
            person("me", []),
            person("a", ["camera", "screen"]),
            person("b", ["camera"]),
        ];
        expect(ids(plan(spots, people).desired)).toEqual([
            "a:camera",
            "a:screen",
        ]);
    });

    it("uses the low layer unless the tile is focused", () => {
        const spots = { me: at(0), a: at(10), b: at(20) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("b", ["camera"]),
        ];
        const result = plan(spots, people, {
            focus: new Map([["me", "b"]]),
        });
        expect(result.desired.map((d) => d.layer)).toEqual(["low", "high"]);
    });

    it("asks for a layer change on an existing consumer", () => {
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["camera"])];
        const result = plan(spots, people, {
            focus: new Map([["me", "a"]]),
            current: new Map([["me", [held("a", "camera")]]]),
        });
        expect(result.setLayer).toEqual([
            { producerId: "a:camera", layer: "high" },
        ]);
    });

    it("pauses and resumes on a near zero video magnitude", () => {
        const dim: MagnitudeRule = (_a, _b, mag) => ({ ...mag, video: 0.01 });
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["camera"])];

        const paused = plan(spots, people, {
            config: { rules: [dim] },
            current: new Map([["me", [held("a", "camera")]]]),
        });
        expect(paused.pause).toEqual(["a:camera"]);

        const resumed = plan(spots, people, {
            current: new Map([
                ["me", [held("a", "camera", { paused: true })]],
            ]),
        });
        expect(resumed.resume).toEqual(["a:camera"]);
    });
});

describe("planSubscriptions privacy", () => {
    it("never consumes someone outside the radius", () => {
        const spots = { me: at(0), ann: at(400) };
        const people = [person("me", []), person("ann", ["audio", "camera"])];
        expect(plan(spots, people).desired).toEqual([]);
    });

    it("never consumes someone in another private room", () => {
        const spots = { me: at(0), ann: at(10), bob: at(10) };
        const people = [
            person("me", [], "room-1"),
            person("ann", ["audio", "camera"], "room-2"),
            person("bob", ["audio"], null),
        ];
        expect(plan(spots, people).desired).toEqual([]);
    });

    it("consumes someone in the same private room", () => {
        const spots = { me: at(0), ann: at(10) };
        const people = [
            person("me", [], "room-1"),
            person("ann", ["audio"], "room-1"),
        ];
        expect(ids(plan(spots, people).desired)).toEqual(["ann:audio"]);
    });

    it("closes consumers of someone who entered a private room", () => {
        const spots = { me: at(0), ann: at(10) };
        const people = [person("me", []), person("ann", ["audio"], "room-2")];
        const result = plan(spots, people, {
            current: new Map([["me", [held("ann", "audio")]]]),
        });
        expect(ids(result.close)).toEqual(["ann:audio"]);
    });
});

describe("planSubscriptions debounce", () => {
    const spots = { me: at(0), ann: at(10) };
    const people = [person("me", []), person("ann", ["audio"])];

    it("defers a change inside the minimum interval", () => {
        const result = planSubscriptions({
            now: 10_100,
            positions: { get: (id) => spots[id as keyof typeof spots] },
            people,
            speakers: [],
            dirtyIds: new Set(["me"]),
            current: new Map(),
            lastChangeAt: new Map([["me", 10_000]]),
        });
        expect(result.deferred).toEqual(["me"]);
        expect(result.plans[0]!.changed).toBe(false);
    });

    it("applies the change once the interval has passed", () => {
        const result = plan(spots, people, {
            now: 10_250,
            lastChangeAt: new Map([["me", 10_000]]),
        });
        expect(ids(result.create)).toEqual(["ann:audio"]);
    });

    it("still revokes right away when someone is no longer reachable", () => {
        const result = plan(
            { me: at(0), ann: at(500) },
            people,
            {
                now: 10_050,
                lastChangeAt: new Map([["me", 10_000]]),
                current: new Map([["me", [held("ann", "audio")]]]),
            }
        );
        expect(ids(result.close)).toEqual(["ann:audio"]);
    });
});

describe("planSubscriptions scope and determinism", () => {
    it("plans only the dirty receivers", () => {
        const spots = { me: at(0), you: at(5), ann: at(10) };
        const people = [person("me", []), person("you", []), person("ann")];
        const result = planSubscriptions({
            now: 1,
            positions: { get: (id) => spots[id as keyof typeof spots] },
            people,
            speakers: [],
            dirtyIds: new Set(["you", "ghost"]),
            current: new Map(),
            lastChangeAt: new Map(),
        });
        expect(result.plans.map((p) => p.receiverId)).toEqual(["you"]);
    });

    it("returns the same plan for the same input", () => {
        const spots = { me: at(0), a: at(30), b: at(30), c: at(30) };
        const people = [
            person("me", []),
            person("c", ["audio", "camera"]),
            person("a", ["audio", "camera"]),
            person("b", ["audio", "camera"]),
        ];
        expect(plan(spots, people)).toEqual(plan(spots, [...people].reverse()));
    });

    it("tags every consumer as a strong connection", () => {
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["audio"])];
        expect(plan(spots, people).desired[0]!.connection).toBe("strong");
    });
});

describe("expandDirtySet", () => {
    it("adds the mover, the neighbours and who consumes the mover", () => {
        const spots: Record<string, Spot> = {
            mover: at(0),
            near: at(50),
            far: at(1000),
            left: at(900),
        };
        const index = {
            get: (id: string) => spots[id],
            query: (x: number, y: number, radius: number) =>
                Object.keys(spots).filter(
                    (id) => Math.hypot(spots[id]!.x - x, spots[id]!.y - y) <= radius
                ),
        };
        const dirty = expandDirtySet(
            ["mover"],
            index,
            new Map([["left", [held("mover", "audio")]]]),
            150
        );
        expect([...dirty].sort()).toEqual(["left", "mover", "near"]);
    });
});
