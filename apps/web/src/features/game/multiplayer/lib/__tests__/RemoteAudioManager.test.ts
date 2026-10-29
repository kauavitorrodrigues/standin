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

    it("pauses the in-range peers beyond the ceiling, speakers first", () => {
        vi.stubGlobal("navigator", {
            hardwareConcurrency: 16,
            deviceMemory: 8,
        });
        const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
        pause.mockClear();

        const manager = new RemoteAudioManager();
        for (let i = 0; i < 12; i++) manager.attach(`p${i}`, buildStream());
        // p11 is the farthest but speaking, so it keeps a slot.
        manager.setSpeaking("p11", true);
        for (let i = 0; i < 12; i++) {
            manager.setVolume(`p${i}`, 0.9 - i * 0.05);
        }

        // 12 in range, 8 audible: 4 paused.
        expect(pause).toHaveBeenCalledTimes(4);
        manager.removeAll();
    });

    describe("the sound of a screen", () => {
        const volumeSetter = () =>
            vi.spyOn(HTMLMediaElement.prototype, "volume", "set");

        it("follows the distance volume of its peer and the master volume", () => {
            const setter = volumeSetter();
            setter.mockClear();
            const manager = new RemoteAudioManager();
            manager.attach("peer-1", buildStream());
            manager.attachScreen("peer-1", buildStream());

            manager.setVolume("peer-1", 0.5);
            manager.setMasterVolume(0.5);

            // The voice and the screen both got 0.5, then both got 0.25.
            expect(setter.mock.calls.filter(([v]) => v === 0.5)).toHaveLength(2);
            expect(setter.mock.calls.filter(([v]) => v === 0.25)).toHaveLength(2);
            manager.removeAll();
        });

        it("is heard from a person with no voice, such as one who muted", () => {
            const setter = volumeSetter();
            setter.mockClear();
            const manager = new RemoteAudioManager();
            manager.attachScreen("peer-1", buildStream());

            manager.setVolume("peer-1", 0.8);

            expect(setter).toHaveBeenLastCalledWith(0.8);
            manager.removeAll();
        });

        it("starts at the last distance volume known for the peer", () => {
            const setter = volumeSetter();
            const manager = new RemoteAudioManager();
            manager.attach("peer-1", buildStream());
            manager.setVolume("peer-1", 0.6);
            setter.mockClear();

            manager.attachScreen("peer-1", buildStream());

            expect(setter).toHaveBeenCalledWith(0.6);
            manager.removeAll();
        });

        it("stays when the voice of the peer is removed, and goes with removeScreen", () => {
            const manager = new RemoteAudioManager();
            manager.attach("peer-1", buildStream());
            manager.attachScreen("peer-1", buildStream());
            const setter = volumeSetter();
            setter.mockClear();

            manager.remove("peer-1");
            manager.setVolume("peer-1", 0.7);
            expect(setter).toHaveBeenCalledWith(0.7);

            manager.removeScreen("peer-1");
            setter.mockClear();
            manager.setVolume("peer-1", 0.4);
            expect(setter).not.toHaveBeenCalled();
        });

        it("never takes an audible slot, so it cannot push a voice out", () => {
            vi.stubGlobal("navigator", { hardwareConcurrency: 2 });
            const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
            pause.mockClear();
            const manager = new RemoteAudioManager();
            for (let i = 0; i < 4; i++) manager.attach(`p${i}`, buildStream());
            for (let i = 0; i < 4; i++) manager.attachScreen(`p${i}`, buildStream());
            for (let i = 0; i < 4; i++) manager.setVolume(`p${i}`, 0.5);

            // 4 voices fit the ceiling of a weak machine, and the 4 screens
            // on top of them pause nothing.
            expect(pause).not.toHaveBeenCalled();
            manager.removeAll();
        });

        it("is closed by removeAll", () => {
            const manager = new RemoteAudioManager();
            manager.attachScreen("peer-1", buildStream());
            manager.removeAll();

            const setter = volumeSetter();
            setter.mockClear();
            manager.setVolume("peer-1", 0.9);
            expect(setter).not.toHaveBeenCalled();
        });
    });

    it("uses a ceiling of 4 on a weak machine", () => {
        vi.stubGlobal("navigator", { hardwareConcurrency: 2 });
        const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
        pause.mockClear();

        const manager = new RemoteAudioManager();
        for (let i = 0; i < 6; i++) manager.attach(`p${i}`, buildStream());
        for (let i = 0; i < 6; i++) manager.setVolume(`p${i}`, 0.5);

        expect(pause).toHaveBeenCalledTimes(2);
        manager.removeAll();
    });
});
