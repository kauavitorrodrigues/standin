import { describe, expect, it, vi } from "vitest";
import { createFakeAudioContext } from "@/features/media-devices/lib/__tests__/fakeAudioContext";
import { playLocalBuffer } from "../playLocalBuffer";

const play = (volume = 1, onEnded?: () => void) => {
    const fake = createFakeAudioContext();
    const buffer = fake.context.createBuffer(1, 1, 44100);
    const stop = playLocalBuffer(fake.context, { buffer, volume, onEnded });
    return { ...fake, stop };
};

describe("playLocalBuffer", () => {
    it("plays to the speakers through a gain at the volume of the clip", () => {
        const { sources, gains, destinationNode } = play(0.4);

        expect(sources.at(0)?.start).toHaveBeenCalled();
        expect(sources.at(0)?.connect).toHaveBeenCalledWith(gains.at(0));
        expect(gains.at(0)?.gain.value).toBe(0.4);
        expect(gains.at(0)?.connect).toHaveBeenCalledWith(destinationNode);
    });

    it("needs no microphone graph: it makes no media stream node", () => {
        const { raw } = play();

        expect(raw.createMediaStreamSource).not.toHaveBeenCalled();
        expect(raw.createMediaStreamDestination).not.toHaveBeenCalled();
    });

    it("clamps a volume outside the range", () => {
        expect(play(5).gains.at(0)?.gain.value).toBe(1);
        expect(play(-1).gains.at(0)?.gain.value).toBe(0);
    });

    it("tries to resume a context that is not running", () => {
        const { raw } = play();

        expect(raw.resume).toHaveBeenCalled();
    });

    it("reports the end of the clip and lets go of the nodes", () => {
        const onEnded = vi.fn();
        const { sources, gains } = play(1, onEnded);

        sources.at(0)?.onended?.();

        expect(onEnded).toHaveBeenCalledTimes(1);
        expect(gains.at(0)?.disconnect).toHaveBeenCalled();
    });

    it("does not report the end when it is stopped by hand", () => {
        const onEnded = vi.fn();
        const { sources, gains, stop } = play(1, onEnded);

        stop();

        expect(sources.at(0)?.stop).toHaveBeenCalled();
        expect(sources.at(0)?.onended).toBeNull();
        expect(gains.at(0)?.disconnect).toHaveBeenCalled();
        expect(onEnded).not.toHaveBeenCalled();
    });
});
