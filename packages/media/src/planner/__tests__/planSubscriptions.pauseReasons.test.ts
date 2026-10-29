import { describe, expect, it } from "vitest";
import { planSubscriptions } from "../planSubscriptions";
import type {
    CurrentConsumer,
    PersonState,
    ProducerKind,
} from "../types";

type Spot = { x: number; y: number };

const person = (id: string, kinds: ProducerKind[] = []): PersonState => ({
    id,
    roomKey: null,
    muted: false,
    headphones: false,
    focusMode: false,
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
    pauseReason: null,
    ...extra,
});

const at = (x: number): Spot => ({ x, y: 0 });

const plan = (
    spots: Record<string, Spot>,
    people: PersonState[],
    extra: Partial<Parameters<typeof planSubscriptions>[0]> = {}
) =>
    planSubscriptions({
        now: 10_000,
        positions: { get: (id) => spots[id] },
        people,
        speakers: [],
        dirtyIds: new Set(["me"]),
        current: new Map(),
        lastChangeAt: new Map(),
        ...extra,
    }).plans[0]!;

// Everybody close, so only the limits decide.
const spots = { me: at(0), a: at(10), b: at(20), c: at(30) };
const cameras = [
    person("me"),
    person("a", ["camera"]),
    person("b", ["camera"]),
    person("c", ["camera"]),
];
const reasonOf = (result: ReturnType<typeof plan>, producerId: string) =>
    result.desired.find((c) => c.producerId === producerId)?.pauseReason;

describe("the limit a weak machine asked for", () => {
    it("plays the first video and holds the next one back for that reason", () => {
        const result = plan(spots, cameras, { config: { activeVideoLimit: 1 } });

        expect(result.desired.map((c) => c.producerId)).toEqual([
            "a:camera",
            "b:camera",
        ]);
        expect(reasonOf(result, "a:camera")).toBeNull();
        expect(reasonOf(result, "b:camera")).toBe("client-limit");
        // It is created already paused, with the reason.
        expect(result.create.find((c) => c.producerId === "b:camera")).toMatchObject({
            paused: true,
            pauseReason: "client-limit",
        });
    });

    it("holds nothing back with no limit lower than the carousel", () => {
        const result = plan(spots, cameras);
        expect(result.desired.every((c) => !c.paused)).toBe(true);
    });

    it("resumes the held video as soon as the limit is lifted", () => {
        const result = plan(spots, cameras, {
            current: new Map([
                [
                    "me",
                    [
                        held("a", "camera"),
                        held("b", "camera", {
                            paused: true,
                            pauseReason: "client-limit",
                        }),
                    ],
                ],
            ]),
        });

        expect(result.resume).toEqual(["b:camera"]);
        expect(result.pause).toEqual([]);
    });

    it("does not say it again while the reason stays the same", () => {
        const result = plan(spots, cameras, {
            config: { activeVideoLimit: 1 },
            current: new Map([
                [
                    "me",
                    [
                        held("a", "camera"),
                        held("b", "camera", {
                            paused: true,
                            pauseReason: "client-limit",
                        }),
                    ],
                ],
            ]),
        });

        expect(result.pause).toEqual([]);
        expect(result.retag).toEqual([]);
        expect(result.changed).toBe(false);
    });
});

describe("what the server sheds when it is short of CPU", () => {
    it("holds back the video that matters least first", () => {
        const result = plan(spots, cameras, { config: { videoShed: 1 } });

        expect(reasonOf(result, "a:camera")).toBeNull();
        expect(reasonOf(result, "b:camera")).toBe("server-limit");
    });

    it("holds back more as the level goes up, down to the carousel", () => {
        const result = plan(spots, cameras, { config: { videoShed: 5 } });

        expect(reasonOf(result, "a:camera")).toBe("server-limit");
        expect(reasonOf(result, "b:camera")).toBe("server-limit");
    });

    it("never holds back a pinned person", () => {
        const result = plan(spots, cameras, {
            pins: new Map([["me", ["a"]]]),
            config: { videoShed: 5 },
        });

        expect(reasonOf(result, "a:camera")).toBeNull();
        expect(reasonOf(result, "b:camera")).toBe("server-limit");
    });

    it("never holds back one of the loudest speakers", () => {
        const result = plan(spots, cameras, {
            speakers: ["a"],
            config: { videoShed: 5, loudestSpeakers: 1 },
        });

        expect(reasonOf(result, "a:camera")).toBeNull();
    });

    it("never holds back audio, nor the sound of a screen", () => {
        const people = [
            person("me"),
            person("a", ["audio", "camera"]),
            person("b", ["audio", "screen", "screen-audio"]),
        ];
        const result = plan({ me: at(0), a: at(10), b: at(20) }, people, {
            config: { videoShed: 5 },
        });

        const byKind = (kind: ProducerKind) =>
            result.desired.filter((c) => c.kind === kind);
        expect(byKind("audio")).toHaveLength(2);
        expect(byKind("audio").every((c) => !c.paused)).toBe(true);
        expect(byKind("screen-audio")).toHaveLength(1);
        expect(byKind("screen-audio")[0]!.paused).toBe(false);
        // The video of the screen and of the camera are held back.
        expect(byKind("screen")[0]!.pauseReason).toBe("server-limit");
        expect(byKind("camera")[0]!.pauseReason).toBe("server-limit");
    });

    it("counts only what would free something, not a video already held for another reason", () => {
        const result = plan(spots, cameras, {
            config: { activeVideoLimit: 1, videoShed: 1 },
        });

        // b waits for the limit of the machine, so the shed reaches a.
        expect(reasonOf(result, "b:camera")).toBe("client-limit");
        expect(reasonOf(result, "a:camera")).toBe("server-limit");
    });

    it("says the new reason when a held video is held for another", () => {
        const result = plan(spots, cameras, {
            config: { videoShed: 1 },
            current: new Map([
                [
                    "me",
                    [
                        held("a", "camera"),
                        held("b", "camera", {
                            paused: true,
                            pauseReason: "client-limit",
                        }),
                    ],
                ],
            ]),
        });

        expect(result.retag).toEqual([
            { producerId: "b:camera", reason: "server-limit" },
        ]);
        expect(result.resume).toEqual([]);
    });
});

describe("the video a receiver hid", () => {
    const hide = (...ids: string[]) =>
        new Map([["me", new Set(ids)]]) as ReadonlyMap<string, ReadonlySet<string>>;
    const people = [
        person("me"),
        person("a", ["audio", "camera", "screen"]),
        person("b", ["audio", "camera"]),
    ];
    const near = { me: at(0), a: at(10), b: at(20) };

    it("has no video of that person, and still hears them", () => {
        const result = plan(near, people, { hiddenVideo: hide("a") });

        const kinds = result.desired.map((c) => `${c.personId}:${c.kind}`);
        expect(kinds).toContain("a:audio");
        expect(kinds).not.toContain("a:camera");
        expect(kinds).not.toContain("a:screen");
        expect(kinds).toContain("b:camera");
    });

    it("closes the video that was flowing", () => {
        const result = plan(near, people, {
            hiddenVideo: hide("a"),
            current: new Map([["me", [held("a", "camera")]]]),
        });

        expect(result.close.map((c) => c.producerId)).toEqual(["a:camera"]);
    });

    it("gives the freed slot to the next person", () => {
        const three = [...people, person("c", ["camera"])];
        const result = plan({ ...near, c: at(30) }, three, {
            hiddenVideo: hide("a"),
        });

        const cameras = result.desired.filter((c) => c.kind === "camera");
        expect(cameras.map((c) => c.personId)).toEqual(["b", "c"]);
    });

    it("survives a plan again: the same input gives the same answer", () => {
        const input = { hiddenVideo: hide("a") };
        expect(plan(near, people, input).desired).toEqual(
            plan(near, people, input).desired
        );
    });

    it("keeps the hiding while the person is in the reach of the video", () => {
        const result = plan(near, people, { hiddenVideo: hide("a") });
        expect(result.releasedHidden).toEqual([]);
    });

    it("ends the hiding when the person leaves the reach of the video", () => {
        const result = plan({ me: at(0), a: at(5000), b: at(20) }, people, {
            hiddenVideo: hide("a"),
        });

        expect(result.releasedHidden).toEqual(["a"]);
        expect(result.changed).toBe(true);
    });

    it("ends the hiding of a person who is gone", () => {
        const result = plan(near, [person("me"), person("b", ["camera"])], {
            hiddenVideo: hide("a"),
        });

        expect(result.releasedHidden).toEqual(["a"]);
    });

    it("shows them again once released", () => {
        const result = plan({ me: at(0), a: at(10), b: at(20) }, people, {
            hiddenVideo: new Map(),
        });

        expect(result.desired.map((c) => `${c.personId}:${c.kind}`)).toContain(
            "a:camera"
        );
    });
});
