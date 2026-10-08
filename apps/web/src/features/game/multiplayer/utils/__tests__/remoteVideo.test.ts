import { describe, expect, it } from "vitest";
import {
    areRemoteVideosEqual,
    NO_REMOTE_MEDIA_STATE,
    resolveVideoTracks,
} from "../remoteVideo";

const track = (id: string, readyState: MediaStreamTrackState = "live") =>
    ({ id, readyState }) as unknown as MediaStreamTrack;

describe("resolveVideoTracks", () => {
    it("resolves nothing when the sender announces nothing", () => {
        const tracks = new Map([["s1", track("t1")]]);

        expect(resolveVideoTracks(tracks, NO_REMOTE_MEDIA_STATE)).toEqual({
            camera: null,
            screen: null,
        });
    });

    it("maps each announced stream id to its slot", () => {
        const camera = track("cam");
        const screen = track("scr");
        const tracks = new Map([
            ["s-cam", camera],
            ["s-scr", screen],
        ]);

        expect(
            resolveVideoTracks(tracks, {
                cameraStreamId: "s-cam",
                screenStreamId: "s-scr",
            })
        ).toEqual({ camera, screen });
    });

    it("does not confuse camera and screen when only one is announced", () => {
        const camera = track("cam");
        const screen = track("scr");
        const tracks = new Map([
            ["s-cam", camera],
            ["s-scr", screen],
        ]);

        expect(
            resolveVideoTracks(tracks, {
                cameraStreamId: null,
                screenStreamId: "s-scr",
            })
        ).toEqual({ camera: null, screen });
    });

    it("waits for a track that was announced before it arrived", () => {
        expect(
            resolveVideoTracks(new Map(), {
                cameraStreamId: "s-cam",
                screenStreamId: null,
            }).camera
        ).toBeNull();
    });

    it("ignores an ended track", () => {
        const tracks = new Map([["s-cam", track("cam", "ended")]]);

        expect(
            resolveVideoTracks(tracks, {
                cameraStreamId: "s-cam",
                screenStreamId: null,
            }).camera
        ).toBeNull();
    });
});

describe("areRemoteVideosEqual", () => {
    const streamA = {} as MediaStream;
    const streamB = {} as MediaStream;

    it("is equal for the same ids and stream identities", () => {
        expect(
            areRemoteVideosEqual(
                [{ id: "a:camera", stream: streamA }],
                [{ id: "a:camera", stream: streamA }]
            )
        ).toBe(true);
    });

    it("differs when the stream object changed", () => {
        expect(
            areRemoteVideosEqual(
                [{ id: "a:camera", stream: streamA }],
                [{ id: "a:camera", stream: streamB }]
            )
        ).toBe(false);
    });

    it("differs in length or id", () => {
        expect(areRemoteVideosEqual([], [{ id: "a", stream: streamA }])).toBe(
            false
        );
        expect(
            areRemoteVideosEqual(
                [{ id: "a", stream: streamA }],
                [{ id: "b", stream: streamA }]
            )
        ).toBe(false);
    });
});
