import { afterEach, describe, expect, it } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useRemoteVideos } from "../useRemoteVideos";

class FakeMediaStream {
    readonly tracks: MediaStreamTrack[];
    constructor(tracks: MediaStreamTrack[] = []) {
        this.tracks = tracks;
    }
}

const camera = (consumerId: string, userId: string) => ({
    consumerId,
    userId,
    source: "camera" as const,
    kind: "video" as const,
    track: { id: `track-${consumerId}` } as MediaStreamTrack,
});

describe("useRemoteVideos pause reasons", () => {
    afterEach(() => {
        unmountAllHooks();
    });

    const mount = () => {
        globalThis.MediaStream = FakeMediaStream as unknown as typeof MediaStream;
        return renderHook(useRemoteVideos);
    };

    it("marks a video the server holds back, and clears it when it plays again", () => {
        const { result, act } = mount();
        act(() => result.current.addTrack(camera("c1", "u1")));
        expect(result.current.remoteVideos[0]!.pauseReason).toBeNull();

        act(() => result.current.setPauseReason("c1", "server-limit"));
        expect(result.current.remoteVideos[0]!.pauseReason).toBe("server-limit");

        act(() => result.current.setPauseReason("c1", null));
        expect(result.current.remoteVideos[0]!.pauseReason).toBeNull();
    });

    it("changes only the video of that consumer", () => {
        const { result, act } = mount();
        act(() => {
            result.current.addTrack(camera("c1", "u1"));
            result.current.addTrack(camera("c2", "u2"));
        });

        act(() => result.current.setPauseReason("c2", "client-limit"));

        const byUser = (userId: string) =>
            result.current.remoteVideos.find((video) => video.userId === userId)!;
        expect(byUser("u1").pauseReason).toBeNull();
        expect(byUser("u2").pauseReason).toBe("client-limit");
    });

    it("ignores a reason for a consumer it does not have", () => {
        const { result, act } = mount();
        act(() => result.current.addTrack(camera("c1", "u1")));
        const before = result.current.remoteVideos;

        act(() => result.current.setPauseReason("ghost", "server-limit"));

        expect(result.current.remoteVideos).toBe(before);
    });

    it("keeps the same stream while the reason changes, so the video does not restart", () => {
        const { result, act } = mount();
        act(() => result.current.addTrack(camera("c1", "u1")));
        const stream = result.current.remoteVideos[0]!.stream;

        act(() => result.current.setPauseReason("c1", "client-limit"));

        expect(result.current.remoteVideos[0]!.stream).toBe(stream);
    });
});
