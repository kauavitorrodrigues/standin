import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const play = vi.fn().mockResolvedValue(true);
const setVolume = vi.fn();
let volume = 0.3;

const load = async () => {
    vi.resetModules();
    vi.doMock("@/features/sounds/lib/soundCatalog", () => ({
        getSoundCatalog: () => ({ notification: { play, setVolume } }),
    }));
    vi.doMock(
        "@/features/notifications/lib/notificationSettingsPreferences",
        () => ({
            notificationSettingsPreference: { get: () => ({ volume }) },
        })
    );
    return await import("@/features/notifications/lib/playNotificationSound");
};

describe("playNotificationSound", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        play.mockClear();
        setVolume.mockClear();
    });
    afterEach(() => vi.useRealTimers());

    it("plays at most two sounds for a burst of five messages in 2 s", async () => {
        const { playNotificationSound } = await load();

        for (let i = 0; i < 5; i++) {
            playNotificationSound();
            vi.advanceTimersByTime(300);
        }
        vi.advanceTimersByTime(500);

        expect(play).toHaveBeenCalledTimes(2);
    });

    it("reads the saved volume before each play", async () => {
        const { playNotificationSoundNow } = await load();

        playNotificationSoundNow();
        volume = 0.8;
        playNotificationSoundNow();

        expect(setVolume.mock.calls).toEqual([[0.3], [0.8]]);
    });
});
