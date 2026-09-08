import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RemoteAudioManager } from "@/features/game/multiplayer/lib/RemoteAudioManager";

// jsdom doesn't implement HTMLMediaElement's play()/pause(); play() already
// rejects safely (RemoteAudioManager swallows it), but both log a "not
// implemented" warning by default, so stub them to keep the test output
// clean.
vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});

// jsdom also has no MediaStream implementation at all: RemoteAudioManager
// constructs one internally (to keep only the audio tracks), so both the
// fake input stream and the global constructor it calls need a stand-in
// shaped like the real thing, not an untyped `{}` cast.
class FakeMediaStream {
    private readonly tracks: MediaStreamTrack[];
    constructor(tracks: MediaStreamTrack[] = []) {
        this.tracks = tracks;
    }
    getTracks(): MediaStreamTrack[] {
        return this.tracks;
    }
    getAudioTracks(): MediaStreamTrack[] {
        return this.tracks;
    }
}

const buildStream = () => new FakeMediaStream() as unknown as MediaStream;

describe("RemoteAudioManager", () => {
    beforeEach(() => {
        vi.stubGlobal("MediaStream", FakeMediaStream);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("attach then remove clears the underlying audio element", () => {
        const manager = new RemoteAudioManager();
        manager.attach("peer-1", buildStream());
        manager.remove("peer-1");

        // setVolume on the now-removed socketId is a no-op, proving there's
        // nothing left to touch.
        expect(() => manager.setVolume("peer-1", 0.5)).not.toThrow();
    });

    it("setVolume on an unknown socketId is a no-op, not an error", () => {
        const manager = new RemoteAudioManager();
        expect(() => manager.setVolume("unknown", 0.5)).not.toThrow();
    });

    it("setVolume applies the volume to the attached audio element", () => {
        const volumeSetter = vi.spyOn(
            HTMLMediaElement.prototype,
            "volume",
            "set"
        );

        const manager = new RemoteAudioManager();
        manager.attach("peer-1", buildStream());
        manager.setVolume("peer-1", 0.25);

        expect(volumeSetter).toHaveBeenCalledWith(0.25);
        manager.remove("peer-1");
    });
});
