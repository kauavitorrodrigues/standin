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
    roomKey: string | null = null,
    muted = false,
    privacy: { headphones?: boolean; focusMode?: boolean } = {}
): PersonState => ({
    id,
    roomKey,
    muted,
    headphones: privacy.headphones ?? false,
    focusMode: privacy.focusMode ?? false,
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

// The radii of the old fixed config, passed explicitly to keep the tests of
// the hysteresis on small numbers.
const SMALL_RADII = {
    audioEnterRadius: 120,
    audioExitRadius: 150,
    videoEnterRadius: 120,
    videoExitRadius: 150,
};

describe("planSubscriptions hysteresis", () => {
    const spots = { me: at(0), ann: at(135) };
    const people = [person("me", []), person("ann")];
    const config = SMALL_RADII;

    it("does not pick up someone between the enter and exit radius", () => {
        expect(plan(spots, people, { config }).create).toEqual([]);
    });

    it("keeps someone already consumed until the exit radius", () => {
        const result = plan(spots, people, {
            config,
            current: new Map([["me", [held("ann", "audio")]]]),
        });
        expect(result.changed).toBe(false);
        expect(ids(result.desired)).toEqual(["ann:audio"]);
    });

    it("drops someone beyond the exit radius", () => {
        const far = { me: at(0), ann: at(151) };
        const result = plan(far, people, {
            config,
            current: new Map([["me", [held("ann", "audio")]]]),
        });
        expect(ids(result.close)).toEqual(["ann:audio"]);
    });

    it("does not flip while oscillating around the boundary", () => {
        let consumers: CurrentConsumer[] = [];
        const flips: boolean[] = [];
        [115, 125, 140, 148, 125, 119, 149, 130].forEach((x) => {
            const result = plan({ me: at(0), ann: at(x) }, people, {
                config,
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

    it("keeps who is already heard instead of swapping for someone slightly closer", () => {
        const result = plan(spots, people, {
            current: new Map([
                ["me", [held("e", "audio"), held("f", "audio")]],
            ]),
        });
        expect(ids(result.desired)).toEqual([
            "a:audio",
            "b:audio",
            "e:audio",
            "f:audio",
        ]);
        expect(ids(result.close)).toEqual([]);
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

    it("uses the low layer unless a layer is requested", () => {
        const spots = { me: at(0), a: at(10), b: at(20) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("b", ["camera"]),
        ];
        const result = plan(spots, people, {
            focus: new Map([["me", new Map([["b", "high" as const]])]]),
        });
        expect(result.desired.map((d) => d.layer)).toEqual(["low", "high"]);
    });

    it("tells the mid layer from the high layer", () => {
        const spots = { me: at(0), a: at(10), b: at(20) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("b", ["camera"]),
        ];
        const result = plan(spots, people, {
            focus: new Map([
                [
                    "me",
                    new Map([
                        ["a", "mid" as const],
                        ["b", "high" as const],
                    ]),
                ],
            ]),
        });
        expect(result.desired.map((d) => d.layer)).toEqual(["mid", "high"]);
    });

    it("ignores a requested person who is not around", () => {
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["camera"])];
        const result = plan(spots, people, {
            focus: new Map([["me", new Map([["ghost", "high" as const]])]]),
        });
        expect(result.desired.map((d) => d.layer)).toEqual(["low"]);
    });

    it("never gives a layer to a screen", () => {
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["screen"])];
        const result = plan(spots, people, {
            focus: new Map([["me", new Map([["a", "high" as const]])]]),
        });
        expect(result.desired.map((d) => d.layer)).toEqual([null]);
    });

    it("asks for a layer change on an existing consumer", () => {
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["camera"])];
        const result = plan(spots, people, {
            focus: new Map([["me", new Map([["a", "high" as const]])]]),
            current: new Map([["me", [held("a", "camera")]]]),
        });
        expect(result.setLayer).toEqual([
            { producerId: "a:camera", layer: "high" },
        ]);
    });

    it("asks for a layer change from high to mid", () => {
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["camera"])];
        const result = plan(spots, people, {
            focus: new Map([["me", new Map([["a", "mid" as const]])]]),
            current: new Map([["me", [held("a", "camera", { layer: "high" })]]]),
        });
        expect(result.setLayer).toEqual([
            { producerId: "a:camera", layer: "mid" },
        ]);
    });

    it("pauses a video consumer at or below the pause threshold", () => {
        const atThreshold: MagnitudeRule = (_a, _b, mag) => ({
            ...mag,
            video: 0.05,
        });
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["camera"])];
        const result = plan(spots, people, {
            config: { rules: [atThreshold], videoPauseMagnitude: 0.05 },
        });
        expect(result.desired.map((d) => d.paused)).toEqual([true]);
    });

    it("does not pause a video consumer inside the default radius", () => {
        const spots = { me: at(0), a: at(150) };
        const people = [person("me", []), person("a", ["camera"])];
        const result = plan(spots, people, {
            current: new Map([["me", [held("a", "camera")]]]),
        });
        expect(result.desired.map((d) => d.paused)).toEqual([false]);
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

describe("planSubscriptions pins", () => {
    const pins = (...userIds: string[]) => new Map([["me", userIds]]);

    it("gives a pinned person a slot before nearer people", () => {
        const spots = { me: at(0), a: at(10), b: at(20), c: at(100) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("b", ["camera"]),
            person("c", ["camera"]),
        ];
        expect(ids(plan(spots, people).desired)).toEqual([
            "a:camera",
            "b:camera",
        ]);
        expect(ids(plan(spots, people, { pins: pins("c") }).desired)).toEqual([
            "a:camera",
            "c:camera",
        ]);
    });

    it("fills the slots with the two pins, ignoring distance", () => {
        const spots = { me: at(0), a: at(10), b: at(20), c: at(100) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("b", ["camera"]),
            person("c", ["camera", "screen"]),
        ];
        const result = plan(spots, people, { pins: pins("b", "a") });
        expect(ids(result.desired)).toEqual(["a:camera", "b:camera"]);
    });

    it("gives nothing to a pinned person out of the video radius", () => {
        const spots = { me: at(0), a: at(10), far: at(500) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("far", ["camera"]),
        ];
        const result = plan(spots, people, { pins: pins("far") });
        expect(ids(result.desired)).toEqual(["a:camera"]);
    });

    it("gives nothing to a pinned person in another private room", () => {
        const spots = { me: at(0), a: at(10), b: at(20) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("b", ["camera"], "room-x"),
        ];
        const result = plan(spots, people, { pins: pins("b") });
        expect(ids(result.desired)).toEqual(["a:camera"]);
    });

    it("is unchanged when the receiver has no pins", () => {
        const spots = { me: at(0), a: at(10), b: at(20), c: at(30) };
        const people = [
            person("me", []),
            person("a", ["camera"]),
            person("b", ["camera"]),
            person("c", ["camera"]),
        ];
        const base = plan(spots, people);
        expect(plan(spots, people, { pins: new Map() })).toEqual(base);
        expect(
            plan(spots, people, { pins: new Map([["other", ["c"]]]) })
        ).toEqual(base);
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

describe("planSubscriptions muted people", () => {
    it("gives no audio consumer to a muted person", () => {
        const spots = { me: at(0), a: at(10), b: at(20) };
        const people = [
            person("me", []),
            person("a", ["audio"], null, true),
            person("b"),
        ];
        expect(ids(plan(spots, people).desired)).toEqual(["b:audio"]);
    });

    it("frees the audio slot of a muted person for the next one", () => {
        const spots = {
            me: at(0),
            a: at(10),
            b: at(20),
            c: at(30),
            d: at(40),
            e: at(50),
        };
        const people = [
            person("me", []),
            person("a", ["audio"], null, true),
            person("b"),
            person("c"),
            person("d"),
            person("e"),
        ];
        expect(ids(plan(spots, people).desired)).toEqual([
            "b:audio",
            "c:audio",
            "d:audio",
            "e:audio",
        ]);
    });

    it("ignores a muted person in the loudest speakers ranking", () => {
        const spots = { me: at(0), a: at(10), b: at(20) };
        const people = [
            person("me", []),
            person("a", ["audio"], null, true),
            person("b"),
        ];
        const result = plan(spots, people, { speakers: ["a", "b"] });
        expect(ids(result.desired)).toEqual(["b:audio"]);
    });

    it("keeps the screen audio of a muted person", () => {
        const spots = { me: at(0), a: at(10) };
        const people = [
            person("me", []),
            person("a", ["audio", "screen", "screen-audio"], null, true),
        ];
        expect(ids(plan(spots, people).desired)).toEqual([
            "a:screen",
            "a:screen-audio",
        ]);
    });

    it("closes the audio consumer held when the person mutes", () => {
        const spots = { me: at(0), a: at(10) };
        const people = [person("me", []), person("a", ["audio"], null, true)];
        const result = plan(spots, people, {
            current: new Map([["me", [held("a", "audio")]]]),
        });
        expect(ids(result.close)).toEqual(["a:audio"]);
    });
});

describe("planSubscriptions headphones and focus mode", () => {
    const spots = { me: at(0), a: at(10), b: at(20) };

    it("gives nothing to a person with headphones on", () => {
        const people = [
            person("me", [], null, false, { headphones: true }),
            person("a", ["audio", "camera"]),
            person("b"),
        ];
        expect(plan(spots, people).desired).toEqual([]);
    });

    it("hides a person with headphones from the others", () => {
        const people = [
            person("me", []),
            person("a", ["audio", "camera"], null, false, { headphones: true }),
            person("b"),
        ];
        expect(ids(plan(spots, people).desired)).toEqual(["b:audio"]);
    });

    it("keeps strong connections for a person in focus mode", () => {
        const people = [
            person("me", [], null, false, { focusMode: true }),
            person("a", ["audio"], null, false, { focusMode: true }),
            person("b"),
        ];
        expect(ids(plan(spots, people).desired)).toEqual([
            "a:audio",
            "b:audio",
        ]);
    });
});

describe("planSubscriptions proximity preset", () => {
    const people = [person("me", []), person("ann")];
    const held200 = { current: new Map([["me", [held("ann", "audio")]]]) };

    it("does not let Short hear someone at 200 px", () => {
        const spots = { me: at(0), ann: at(200) };
        const result = plan(spots, people, { config: { preset: "Short" } });
        expect(result.desired).toEqual([]);
    });

    it("lets Long hear someone at 200 px", () => {
        const spots = { me: at(0), ann: at(200) };
        const result = plan(spots, people, { config: { preset: "Long" } });
        expect(ids(result.desired)).toEqual(["ann:audio"]);
    });

    it("uses Long when no preset is given", () => {
        const spots = { me: at(0), ann: at(380) };
        expect(ids(plan(spots, people).desired)).toEqual(["ann:audio"]);
    });

    it("cuts Short at 160 px, the curve is 0 there so the band does not hold", () => {
        const config = { preset: "Short" as const };
        const inside = { me: at(0), ann: at(159) };
        expect(ids(plan(inside, people, { config }).create)).toEqual([
            "ann:audio",
        ]);
        const band = { me: at(0), ann: at(175) };
        expect(plan(band, people, { config }).create).toEqual([]);
        expect(
            ids(plan(band, people, { config, ...held200 }).close)
        ).toEqual(["ann:audio"]);
    });

    it("applies the Long hysteresis band of 384 to 414 px", () => {
        const config = { preset: "Long" as const };
        const band = { me: at(0), ann: at(400) };
        expect(plan(band, people, { config }).create).toEqual([]);
        expect(
            plan(band, people, { config, ...held200 }).changed
        ).toBe(false);
        const out = { me: at(0), ann: at(415) };
        expect(
            ids(plan(out, people, { config, ...held200 }).close)
        ).toEqual(["ann:audio"]);
    });

    it("keeps an explicit radius over the preset", () => {
        const spots = { me: at(0), ann: at(200) };
        const result = plan(spots, people, {
            config: { preset: "Long", ...SMALL_RADII },
        });
        expect(result.desired).toEqual([]);
    });
});
