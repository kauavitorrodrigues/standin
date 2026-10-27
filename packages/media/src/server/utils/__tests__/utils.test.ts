import { describe, expect, it } from "vitest";
import type { Peer } from "../../spaceTypes";
import { createPeer } from "../createPeer";
import { isSameRanking, canReceive } from "../peerQueries";
import { speakersHeardBy } from "../speakersHeardBy";
import { splitReceivers } from "../splitReceivers";
import { buildFocusMap, buildPeople } from "../buildPlannerInput";
import { countMedia } from "../countMedia";

const receiver = (id: string, patch: Partial<Peer> = {}): Peer => ({
    ...createPeer(id, `user-${id}`),
    recvTransport: {} as Peer["recvTransport"],
    rtpCapabilities: {} as Peer["rtpCapabilities"],
    ...patch,
});

describe("media utils", () => {
    it("compares rankings in order", () => {
        expect(isSameRanking(["a", "b"], ["a", "b"])).toBe(true);
        expect(isSameRanking(["a", "b"], ["b", "a"])).toBe(false);
        expect(isSameRanking([], ["a"])).toBe(false);
    });

    it("needs a receive transport and capabilities to receive", () => {
        expect(canReceive(createPeer("a", "u"))).toBe(false);
        expect(canReceive(receiver("a"))).toBe(true);
    });

    it("splits the dirty people by readiness and quality", () => {
        const peers = new Map<string, Peer>([
            ["ready", receiver("ready")],
            ["weak", receiver("weak", { lowQuality: true })],
            ["busy", receiver("busy", { applying: true })],
            ["new", createPeer("new", "u")],
        ]);
        const split = splitReceivers(
            new Set(["ready", "weak", "busy", "new", "ghost"]),
            peers
        );
        expect([...split.normal]).toEqual(["ready"]);
        expect([...split.low]).toEqual(["weak"]);
        expect(split.busy).toEqual(["busy"]);
    });

    it("shows a receiver only the speakers it hears and itself", () => {
        const peer = receiver("r");
        peer.consumers.set("p1", {
            ownerId: "a",
            kind: "audio",
        } as Peer["consumers"] extends Map<string, infer E> ? E : never);
        expect(speakersHeardBy(peer, ["a", "b", "r"])).toEqual(["a", "r"]);
    });

    it("ignores the focus of a weak machine", () => {
        const peers = [
            receiver("a", { focus: new Map([["b", "mid"]]) }),
            receiver("c", {
                focus: new Map([["b", "high"]]),
                lowQuality: true,
            }),
        ];
        expect([...buildFocusMap(peers)]).toEqual([
            ["a", new Map([["b", "mid"]])],
        ]);
    });

    it("leaves out a receiver that asked for no layer", () => {
        expect(buildFocusMap([receiver("a")]).size).toBe(0);
    });

    it("carries the muted flag of each peer to the planner", () => {
        const people = buildPeople([
            receiver("a", { muted: true }),
            receiver("b"),
        ]);
        expect(people.map((entry) => [entry.id, entry.muted])).toEqual([
            ["a", true],
            ["b", false],
        ]);
    });

    it("carries the privacy flags of each peer to the planner", () => {
        const people = buildPeople([
            receiver("a", { headphones: true, focusMode: true }),
            receiver("b"),
        ]);
        expect(
            people.map((entry) => [entry.id, entry.headphones, entry.focusMode])
        ).toEqual([
            ["a", true, true],
            ["b", false, false],
        ]);
    });

    it("counts what the peers hold", () => {
        const peers = new Map([
            [
                "a",
                receiver("a", { sendTransport: {} as Peer["sendTransport"] }),
            ],
        ]);
        expect(countMedia(peers)).toEqual({
            peers: 1,
            transports: 2,
            producers: 0,
            consumers: 0,
        });
    });
});
