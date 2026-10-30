import { describe, expect, it, vi } from "vitest";
import { MIXER_LIMITER } from "../../consts/limiter";
import { createMicMixer, keepContextRunning } from "../micMixer";
import {
    createFakeAudioContext,
    createFakeMicStream,
} from "./fakeAudioContext";

const BUFFER = createFakeAudioContext().context.createBuffer(1, 1, 44100);
const clip = (playId = "p1", volume = 1, onEnded?: () => void) => ({
    playId,
    buffer: BUFFER,
    volume,
    onEnded,
});

const setup = () => {
    const fake = createFakeAudioContext();
    const mic = createFakeMicStream();
    const mixer = createMicMixer(fake.context, mic.stream);
    return { ...fake, mic, mixer };
};

describe("createMicMixer", () => {
    it("publishes the destination stream, not the raw microphone", () => {
        const { mixer, mic, mediaDestination } = setup();

        expect(mixer.stream).toBe(mediaDestination.stream);
        expect(mixer.stream).not.toBe(mic.stream);
    });

    it("routes the microphone straight through its gain into the destination", () => {
        const { gain, mediaDestination } = setup();

        expect(gain.connect).toHaveBeenCalledWith(mediaDestination);
    });

    it("keeps the microphone out of the limiter", () => {
        const { gain, limiters } = setup();

        expect(gain.connect).not.toHaveBeenCalledWith(limiters.at(0));
        expect(limiters.at(0)?.connect).toHaveBeenCalledTimes(1);
    });

    it("puts the limiter between the clips and the destination", () => {
        const { mixer, gains, limiters, mediaDestination } = setup();

        mixer.playClip(clip());

        expect(gains.at(1)?.connect).toHaveBeenCalledWith(limiters.at(0));
        expect(limiters.at(0)?.connect).toHaveBeenCalledWith(mediaDestination);
    });

    it("sets the limiter to catch only peaks", () => {
        const { limiters } = setup();

        expect(limiters).toHaveLength(1);
        expect(limiters.at(0)?.threshold.value).toBe(MIXER_LIMITER.thresholdDb);
        expect(limiters.at(0)?.ratio.value).toBe(MIXER_LIMITER.ratio);
        expect(limiters.at(0)?.knee.value).toBe(MIXER_LIMITER.kneeDb);
        expect(limiters.at(0)?.attack.value).toBe(MIXER_LIMITER.attackSeconds);
        expect(limiters.at(0)?.release.value).toBe(
            MIXER_LIMITER.releaseSeconds
        );
    });

    it("mutes the microphone through the gain, not the published track", () => {
        const { mixer, gain, publishedTrack } = setup();

        mixer.setMicEnabled(false);
        expect(gain.gain.value).toBe(0);
        expect(publishedTrack.enabled).toBe(true);

        mixer.setMicEnabled(true);
        expect(gain.gain.value).toBe(1);
    });

    it("gates the whole published track with the proximity gate", () => {
        const { mixer, publishedTrack } = setup();

        mixer.setPublishEnabled(false);
        expect(publishedTrack.enabled).toBe(false);

        mixer.setPublishEnabled(true);
        expect(publishedTrack.enabled).toBe(true);
    });

    it("keeps a playing clip on the published path while the mic is muted", () => {
        const { mixer, sources, gains, limiters } = setup();

        mixer.setMicEnabled(false);
        mixer.playClip(clip());

        expect(gains.at(0)?.gain.value).toBe(0);
        expect(sources.at(0)?.connect).toHaveBeenCalledWith(gains.at(1));
        expect(gains.at(1)?.connect).toHaveBeenCalledWith(limiters.at(0));
        expect(sources.at(0)?.start).toHaveBeenCalled();
    });

    it("sends the clip through the limiter and not straight to the destination", () => {
        const { mixer, gains, mediaDestination } = setup();

        mixer.playClip(clip());

        expect(gains.at(1)?.connect).not.toHaveBeenCalledWith(mediaDestination);
    });

    it("applies the volume of the clip as a gain on its source", () => {
        const { mixer, gains } = setup();

        mixer.playClip(clip("p1", 0.4));

        expect(gains.at(1)?.gain.value).toBe(0.4);
        // The microphone gain is not touched by a quiet clip.
        expect(gains.at(0)?.gain.value).toBe(1);
    });

    it("clamps a volume outside the range", () => {
        const { mixer, gains } = setup();

        mixer.playClip(clip("p1", 7));
        mixer.playClip(clip("p2", -1));

        expect(gains.at(1)?.gain.value).toBe(1);
        expect(gains.at(2)?.gain.value).toBe(0);
    });

    it("plays the clip to the local speakers as well as to the published stream", () => {
        const { mixer, gains, destinationNode, limiters } = setup();

        mixer.playClip(clip());

        expect(gains.at(1)?.connect).toHaveBeenCalledWith(limiters.at(0));
        expect(gains.at(1)?.connect).toHaveBeenCalledWith(destinationNode);
    });

    it("keeps the microphone and the limiter out of the local speakers", () => {
        const { mixer, gains, limiters, destinationNode } = setup();

        mixer.playClip(clip());

        expect(gains.at(0)?.connect).not.toHaveBeenCalledWith(destinationNode);
        expect(limiters.at(0)?.connect).not.toHaveBeenCalledWith(
            destinationNode
        );
    });

    it("resumes a suspended context when a clip starts", () => {
        const { mixer, raw } = setup();
        raw.state = "suspended";

        mixer.playClip(clip());

        expect(raw.resume).toHaveBeenCalled();
    });

    it("releases the graph, the tracks and the context on dispose", () => {
        const { mixer, mic, publishedTrack, raw, sources, limiters } = setup();
        mixer.playClip(clip());

        mixer.dispose();

        expect(sources.at(0)?.stop).toHaveBeenCalled();
        expect(mic.track.stop).toHaveBeenCalled();
        expect(publishedTrack.stop).toHaveBeenCalled();
        expect(limiters.at(0)?.disconnect).toHaveBeenCalled();
        expect(raw.close).toHaveBeenCalled();
    });
});

describe("overlapping plays", () => {
    it("does not stop a play when another starts", () => {
        const { mixer, sources } = setup();

        mixer.playClip(clip("p1"));
        mixer.playClip(clip("p2"));

        expect(sources).toHaveLength(2);
        expect(sources.at(0)?.stop).not.toHaveBeenCalled();
        expect(sources.at(1)?.stop).not.toHaveBeenCalled();
    });

    it("lets the same clip overlap itself, one gain for each play", () => {
        const { mixer, gains, sources } = setup();

        mixer.playClip(clip("p1", 0.5));
        mixer.playClip(clip("p2", 0.5));

        expect(sources).toHaveLength(2);
        expect(gains.at(1)).not.toBe(gains.at(2));
        expect(gains.at(1)?.gain.value).toBe(0.5);
        expect(gains.at(2)?.gain.value).toBe(0.5);
    });

    it("gives each play its own volume", () => {
        const { mixer, gains } = setup();

        mixer.playClip(clip("p1", 0.2));
        mixer.playClip(clip("p2", 0.9));

        expect(gains.at(1)?.gain.value).toBe(0.2);
        expect(gains.at(2)?.gain.value).toBe(0.9);
    });

    it("ends each play on its own, and reports only that one", () => {
        const { mixer, sources, gains } = setup();
        const first = vi.fn();
        const second = vi.fn();
        mixer.playClip(clip("p1", 1, first));
        mixer.playClip(clip("p2", 1, second));

        sources.at(0)?.onended?.();

        expect(first).toHaveBeenCalledTimes(1);
        expect(second).not.toHaveBeenCalled();
        expect(gains.at(1)?.disconnect).toHaveBeenCalled();
        expect(gains.at(2)?.disconnect).not.toHaveBeenCalled();
        expect(sources.at(0)?.disconnect).toHaveBeenCalled();
    });

    it("reports the end of a play once", () => {
        const { mixer, sources } = setup();
        const onEnded = vi.fn();
        mixer.playClip(clip("p1", 1, onEnded));

        sources.at(0)?.onended?.();
        sources.at(0)?.onended?.();

        expect(onEnded).toHaveBeenCalledTimes(1);
    });

    it("stops one play by its id, detaching its nodes, and does not report it", () => {
        const { mixer, sources, gains } = setup();
        const onEnded = vi.fn();
        mixer.playClip(clip("p1", 1, onEnded));
        mixer.playClip(clip("p2"));

        mixer.stopClip("p1");

        expect(sources.at(0)?.stop).toHaveBeenCalled();
        expect(sources.at(0)?.onended).toBeNull();
        expect(gains.at(1)?.disconnect).toHaveBeenCalled();
        expect(sources.at(1)?.stop).not.toHaveBeenCalled();
        expect(onEnded).not.toHaveBeenCalled();
    });

    it("ignores a stop for a play that is not running", () => {
        const { mixer, sources } = setup();
        mixer.playClip(clip("p1"));

        mixer.stopClip("unknown");

        expect(sources.at(0)?.stop).not.toHaveBeenCalled();
    });

    it("ignores a stop for a play that already ended", () => {
        const { mixer, sources } = setup();
        mixer.playClip(clip("p1"));
        sources.at(0)?.onended?.();

        mixer.stopClip("p1");

        expect(sources.at(0)?.stop).not.toHaveBeenCalled();
    });

    it("stops every play at once", () => {
        const { mixer, sources } = setup();
        mixer.playClip(clip("p1"));
        mixer.playClip(clip("p2"));
        mixer.playClip(clip("p3"));

        mixer.stopAllClips();

        expect(sources.map((source) => source.stop.mock.calls.length)).toEqual([
            1, 1, 1,
        ]);
    });

    it("keeps working after every play was stopped", () => {
        const { mixer, sources } = setup();
        mixer.playClip(clip("p1"));
        mixer.stopAllClips();

        mixer.playClip(clip("p2"));

        expect(sources.at(1)?.start).toHaveBeenCalled();
        expect(sources.at(1)?.stop).not.toHaveBeenCalled();
    });

    it("leaves the mic mute and the proximity gate working with plays running", () => {
        const { mixer, gains, publishedTrack } = setup();
        mixer.playClip(clip("p1"));
        mixer.playClip(clip("p2"));

        mixer.setMicEnabled(false);
        mixer.setPublishEnabled(false);

        expect(gains.at(0)?.gain.value).toBe(0);
        expect(publishedTrack.enabled).toBe(false);
    });
});

describe("keepContextRunning", () => {
    const createTarget = () => {
        const listeners = new Map<string, () => void>();
        return {
            listeners,
            target: {
                addEventListener: vi.fn((type: string, fn: () => void) =>
                    listeners.set(type, fn)
                ),
                removeEventListener: vi.fn((type: string) =>
                    listeners.delete(type)
                ),
            },
        };
    };

    const createContext = (state: string) => {
        const handlers: Array<() => void> = [];
        return {
            state,
            resume: vi.fn(() => Promise.resolve()),
            addEventListener: vi.fn((_: string, fn: () => void) =>
                handlers.push(fn)
            ),
            removeEventListener: vi.fn(),
            fireStateChange: () => handlers.forEach((fn) => fn()),
        };
    };

    it("does nothing for a running context", () => {
        const context = createContext("running");
        const { target } = createTarget();

        keepContextRunning(context as never, target);

        expect(context.resume).not.toHaveBeenCalled();
        expect(target.addEventListener).not.toHaveBeenCalled();
    });

    it("resumes on the first gesture of a suspended context and stops listening", () => {
        const context = createContext("suspended");
        const { target, listeners } = createTarget();

        keepContextRunning(context as never, target);
        context.resume.mockClear();
        listeners.get("pointerdown")?.();

        expect(context.resume).toHaveBeenCalledTimes(1);
        expect(listeners.size).toBe(0);
    });

    it("arms the recovery again when the context is suspended later", () => {
        const context = createContext("running");
        const { target, listeners } = createTarget();
        keepContextRunning(context as never, target);

        context.state = "suspended";
        context.fireStateChange();

        expect(context.resume).toHaveBeenCalled();
        expect(listeners.has("pointerdown")).toBe(true);
    });

    it("treats interrupted like suspended", () => {
        const context = createContext("running");
        const { target, listeners } = createTarget();
        keepContextRunning(context as never, target);

        context.state = "interrupted";
        context.fireStateChange();

        expect(listeners.has("keydown")).toBe(true);
    });

    it("gives up on a closed context", () => {
        const context = createContext("running");
        const { target } = createTarget();
        keepContextRunning(context as never, target);

        context.state = "closed";
        context.fireStateChange();

        expect(context.resume).not.toHaveBeenCalled();
        expect(target.addEventListener).not.toHaveBeenCalled();
    });

    it("removes every listener on cleanup", () => {
        const context = createContext("suspended");
        const { target, listeners } = createTarget();

        keepContextRunning(context as never, target)();

        expect(context.removeEventListener).toHaveBeenCalledWith(
            "statechange",
            expect.any(Function)
        );
        expect(listeners.size).toBe(0);
    });
});
