import { describe, expect, it } from "vitest";
import { buildNameLookup, buildStageTiles as build } from "@/features/spaces/utils/buildStageTiles";
import type { RemoteVideo } from "@/features/game/multiplayer/types/remoteVideo";

const stream = (name: string) => ({ name }) as unknown as MediaStream;

const remote = (
    socketId: string,
    userId: string | null,
    slot: RemoteVideo["slot"]
): RemoteVideo => ({
    id: `${socketId}:${slot}`,
    socketId,
    userId,
    slot,
    stream: stream(`${socketId}-${slot}`),
});

const names = buildNameLookup([
    { id: "u1", name: "Ana", avatarUrl: null },
    { id: "u2", name: "Bruno", avatarUrl: null },
]);

type Input = Parameters<typeof build>[0];

const buildStageTiles = (
    input: Omit<Input, "nearbyUserIds" | "selfUserId" | "includeSelf"> &
        Partial<Pick<Input, "nearbyUserIds" | "includeSelf">>
) =>
    build({
        nearbyUserIds: [],
        selfUserId: "me",
        includeSelf: false,
        ...input,
    });

describe("buildStageTiles", () => {
    it("is empty when nothing is being sent or received", () => {
        expect(
            buildStageTiles({
                remoteVideos: [],
                localCameraStream: null,
                localScreenStream: null,
                names,
            })
        ).toEqual([]);
    });

    it("labels a remote tile with the participant's name", () => {
        const [tile] = buildStageTiles({
            remoteVideos: [remote("s1", "u1", "camera")],
            localCameraStream: null,
            localScreenStream: null,
            names,
        });

        expect(tile.label).toBe("Ana");
        expect(tile.isSelf).toBe(false);
    });

    it("marks a screen tile in its label", () => {
        const [tile] = buildStageTiles({
            remoteVideos: [remote("s1", "u2", "screen")],
            localCameraStream: null,
            localScreenStream: null,
            names,
        });

        expect(tile.label).toBe("Bruno (tela)");
    });

    it("falls back to a neutral label for an unknown person", () => {
        const tiles = buildStageTiles({
            remoteVideos: [
                remote("s1", "ghost", "camera"),
                remote("s2", null, "camera"),
            ],
            localCameraStream: null,
            localScreenStream: null,
            names,
        });

        expect(tiles.map((tile) => tile.label)).toEqual(["Alguém", "Alguém"]);
    });

    it("includes the local previews, flagged as self", () => {
        const tiles = buildStageTiles({
            remoteVideos: [],
            localCameraStream: stream("cam"),
            localScreenStream: stream("scr"),
            names,
            includeSelf: true,
        });

        expect(tiles.every((tile) => tile.isSelf)).toBe(true);
        expect(tiles.map((tile) => tile.id).sort()).toEqual([
            "self:camera",
            "self:screen",
        ]);
    });

    it("puts screens before cameras, keeping order inside each group", () => {
        const tiles = buildStageTiles({
            remoteVideos: [
                remote("s1", "u1", "camera"),
                remote("s2", "u2", "screen"),
                remote("s3", "u1", "camera"),
            ],
            localCameraStream: null,
            localScreenStream: null,
            names,
        });

        expect(tiles.map((tile) => tile.id)).toEqual([
            "s2:screen",
            "s1:camera",
            "s3:camera",
        ]);
    });

    it("keeps our own camera preview after the other cameras", () => {
        const tiles = buildStageTiles({
            remoteVideos: [remote("s1", "u1", "camera")],
            localCameraStream: stream("cam"),
            localScreenStream: null,
            names,
            includeSelf: true,
        });

        expect(tiles.map((tile) => tile.id)).toEqual([
            "s1:camera",
            "self:camera",
        ]);
    });

    it("shows an avatar tile for someone nearby without a camera", () => {
        const tiles = buildStageTiles({
            remoteVideos: [],
            localCameraStream: null,
            localScreenStream: null,
            names,
            nearbyUserIds: ["u1"],
        });

        expect(tiles).toHaveLength(1);
        expect(tiles[0]).toMatchObject({
            id: "u1:avatar",
            stream: null,
            label: "Ana",
            isSelf: false,
        });
    });

    it("swaps the avatar for the camera once the person sends one", () => {
        const tiles = buildStageTiles({
            remoteVideos: [remote("s1", "u1", "camera")],
            localCameraStream: null,
            localScreenStream: null,
            names,
            nearbyUserIds: ["u1", "u2"],
        });

        expect(tiles.map((tile) => tile.id)).toEqual([
            "s1:camera",
            "u2:avatar",
        ]);
    });

    it("uses our own avatar when our camera is off", () => {
        const tiles = buildStageTiles({
            remoteVideos: [],
            localCameraStream: null,
            localScreenStream: null,
            names,
            nearbyUserIds: ["u1"],
            includeSelf: true,
        });

        const self = tiles.find((tile) => tile.isSelf);
        expect(self).toMatchObject({ id: "self:camera", stream: null });
        expect(tiles.at(-1)?.isSelf).toBe(true);
    });

    it("leaves ourselves out when the bottom bar owns our preview", () => {
        const tiles = buildStageTiles({
            remoteVideos: [],
            localCameraStream: stream("cam"),
            localScreenStream: null,
            names,
        });

        expect(tiles).toEqual([]);
    });
});
