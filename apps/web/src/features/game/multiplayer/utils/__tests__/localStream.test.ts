import { describe, expect, it } from "vitest";
import type Peer from "simple-peer";
import { getPeersMissingLocalStream } from "@/features/game/multiplayer/utils/localStream";

const buildPeers = (socketIds: string[]): Map<string, Peer.Instance> =>
    new Map(socketIds.map((socketId) => [socketId, {} as Peer.Instance]));

describe("getPeersMissingLocalStream", () => {
    it("returns every peer when none have the stream attached yet", () => {
        const peers = buildPeers(["a", "b"]);
        expect(getPeersMissingLocalStream(peers, new Set())).toEqual([
            "a",
            "b",
        ]);
    });

    it("excludes peers already marked as attached", () => {
        const peers = buildPeers(["a", "b", "c"]);
        expect(getPeersMissingLocalStream(peers, new Set(["b"]))).toEqual([
            "a",
            "c",
        ]);
    });

    it("returns nothing when every connected peer already has the stream", () => {
        const peers = buildPeers(["a", "b"]);
        expect(getPeersMissingLocalStream(peers, new Set(["a", "b"]))).toEqual(
            []
        );
    });

    it("returns nothing for an empty peer map", () => {
        expect(getPeersMissingLocalStream(new Map(), new Set(["a"]))).toEqual(
            []
        );
    });
});
