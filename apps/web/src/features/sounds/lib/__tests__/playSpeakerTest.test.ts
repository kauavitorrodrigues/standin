import { beforeEach, describe, expect, it, vi } from "vitest";

const play = vi.fn().mockResolvedValue(true);
const setVolume = vi.fn();

describe("playSpeakerTest", () => {
    beforeEach(() => {
        play.mockClear();
        setVolume.mockClear();
    });

    it("plays at the output volume of the other people", async () => {
        vi.resetModules();
        vi.doMock("@/features/sounds/lib/soundCatalog", () => ({
            getSoundCatalog: () => ({ speakerTest: { play, setVolume } }),
        }));
        vi.doMock(
            "@/features/media-devices/lib/audioSettingsPreferences",
            () => ({
                outputVolumePreference: { get: () => 0.25 },
            })
        );
        const { playSpeakerTest } =
            await import("@/features/sounds/lib/playSpeakerTest");

        playSpeakerTest();

        expect(setVolume).toHaveBeenCalledWith(0.25);
        expect(play).toHaveBeenCalledTimes(1);
    });
});
