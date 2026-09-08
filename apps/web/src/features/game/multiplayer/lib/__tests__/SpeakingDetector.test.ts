import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    __resetSharedAudioContextForTests,
    SpeakingDetector,
} from "@/features/game/multiplayer/lib/SpeakingDetector";
import { SPEAKING_POLL_INTERVAL_MS } from "@/features/game/multiplayer/consts/audio";

// jsdom has no Web Audio implementation at all, so AudioContext/AnalyserNode
// are stubbed here. The fake analyser's getByteTimeDomainData is driven by
// `loudness` (a module-scoped byte value each test sets before advancing
// timers), which lets a test simulate "loud" vs. "silent" input without a
// real microphone.
let loudness = 128;
// Every FakeAudioContext a test constructs starts in this state - lets a
// test simulate a context that requires a user gesture to resume.
let initialContextState: AudioContextState = "running";

class FakeAnalyserNode {
    fftSize = 2048;
    connect = vi.fn();
    getByteTimeDomainData(array: Uint8Array): void {
        array.fill(loudness);
    }
}

class FakeAudioContext {
    static instances: FakeAudioContext[] = [];

    state: AudioContextState = initialContextState;
    createAnalyser = vi.fn(() => new FakeAnalyserNode());
    createMediaStreamSource = vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
    }));
    resume = vi.fn(async () => {
        this.state = "running";
    });

    constructor() {
        FakeAudioContext.instances.push(this);
    }
}

describe("SpeakingDetector", () => {
    beforeEach(() => {
        loudness = 128;
        initialContextState = "running";
        FakeAudioContext.instances = [];
        vi.useFakeTimers();
        vi.stubGlobal("AudioContext", FakeAudioContext);
        // Without this, the module-level shared AudioContext singleton
        // would carry the previous test's fake instance (and its resume-
        // gesture latch) into this one, since nothing else ever resets it.
        __resetSharedAudioContextForTests();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("does not call onSpeakingChange when stopping a detector that never started", () => {
        const onSpeakingChange = vi.fn();
        new SpeakingDetector({ onSpeakingChange }).stop();

        expect(onSpeakingChange).not.toHaveBeenCalled();
    });

    it("reports speaking once loud samples cross the threshold for two consecutive polls", () => {
        const onSpeakingChange = vi.fn();
        const detector = new SpeakingDetector({ onSpeakingChange });

        loudness = 255;
        detector.start({} as MediaStream);
        vi.advanceTimersByTime(SPEAKING_POLL_INTERVAL_MS);

        expect(onSpeakingChange).toHaveBeenCalledWith(true);

        detector.stop();
    });

    it("does not flip on a single loud sample surrounded by silence", () => {
        const onSpeakingChange = vi.fn();
        const detector = new SpeakingDetector({ onSpeakingChange });

        loudness = 128;
        detector.start({} as MediaStream);
        loudness = 255;
        vi.advanceTimersByTime(SPEAKING_POLL_INTERVAL_MS);
        loudness = 128;
        vi.advanceTimersByTime(SPEAKING_POLL_INTERVAL_MS);

        expect(onSpeakingChange).not.toHaveBeenCalled();

        detector.stop();
    });

    it("stays silent for near-midpoint (silence) samples", () => {
        const onSpeakingChange = vi.fn();
        const detector = new SpeakingDetector({ onSpeakingChange });

        loudness = 128;
        detector.start({} as MediaStream);
        vi.advanceTimersByTime(SPEAKING_POLL_INTERVAL_MS * 3);

        expect(onSpeakingChange).not.toHaveBeenCalled();

        detector.stop();
    });

    it("reports not-speaking on stop after having reported speaking", () => {
        const onSpeakingChange = vi.fn();
        const detector = new SpeakingDetector({ onSpeakingChange });

        loudness = 255;
        detector.start({} as MediaStream);
        vi.advanceTimersByTime(SPEAKING_POLL_INTERVAL_MS);
        onSpeakingChange.mockClear();

        detector.stop();

        expect(onSpeakingChange).toHaveBeenCalledWith(false);
    });

    it("stops polling after stop() is called", () => {
        const onSpeakingChange = vi.fn();
        const detector = new SpeakingDetector({ onSpeakingChange });

        loudness = 255;
        detector.start({} as MediaStream);
        vi.advanceTimersByTime(SPEAKING_POLL_INTERVAL_MS);
        detector.stop();
        onSpeakingChange.mockClear();

        vi.advanceTimersByTime(SPEAKING_POLL_INTERVAL_MS * 5);

        expect(onSpeakingChange).not.toHaveBeenCalled();
    });

    it("resumes a suspended shared context once a gesture is observed", () => {
        initialContextState = "suspended";
        const detector = new SpeakingDetector({ onSpeakingChange: vi.fn() });

        detector.start({} as MediaStream);
        const audioContext = FakeAudioContext.instances[0];
        expect(audioContext.resume).toHaveBeenCalledTimes(1);

        audioContext.state = "suspended";
        window.dispatchEvent(new Event("pointerdown"));
        expect(audioContext.resume).toHaveBeenCalledTimes(2);

        detector.stop();
    });
});
