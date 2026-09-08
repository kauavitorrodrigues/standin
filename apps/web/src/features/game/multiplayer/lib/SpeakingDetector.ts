import { SPEAKING_POLL_INTERVAL_MS, SPEAKING_THRESHOLD } from "../consts/audio";
import { checkIsSpeaking } from "../utils/audio";

export type SpeakingDetectorOptions = {
    onSpeakingChange: (isSpeaking: boolean) => void;
};

// A flip only reported once this many consecutive polls agree, so a sample
// that briefly dips (or spikes) right around SPEAKING_THRESHOLD doesn't
// visibly flicker the speaking ring. At SPEAKING_POLL_INTERVAL_MS that's a
// ~200ms debounce either direction - short enough to still feel responsive.
const REQUIRED_CONSECUTIVE_SAMPLES = 2;

// Lazily created, shared by every SpeakingDetector instance (one per local
// or remote stream). A room with N peers would otherwise construct N+1
// AudioContexts, which is wasteful and risks hitting a browser's per-page
// context limit (historically 6 in Chromium); every detector instead gets
// its own MediaStreamSource + AnalyserNode on this one context, disconnected
// (not closed) in stop(). Never explicitly closed either: it holds no
// connection to `destination` (nothing ever calls .connect() on it), so an
// idle context left open across Space sessions has no output path and costs
// nothing to leave alive.
let sharedAudioContext: AudioContext | null = null;
let resumeGestureAttached = false;

// Test-only seam: without this, the module-level singleton above would leak
// a fake AudioContext (and its "resumeGestureAttached" latch) from whichever
// test happens to run first into every test after it, since nothing else in
// this module ever resets it.
export const __resetSharedAudioContextForTests = (): void => {
    sharedAudioContext = null;
    resumeGestureAttached = false;
};

const getSharedAudioContext = (): AudioContext => {
    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
        sharedAudioContext = new AudioContext();
    }
    return sharedAudioContext;
};

// A context created (or resumed) without a prior user gesture stays
// "suspended" - resume() rejects instead of throwing, and browsers don't
// retry it on their own once the user finally interacts with the page, so
// this has to keep trying on every gesture until it actually succeeds.
const attemptResumeSharedAudioContext = (): void => {
    if (!sharedAudioContext || sharedAudioContext.state !== "suspended") return;
    void sharedAudioContext.resume().catch(() => {});
};

const ensureResumeOnGesture = (): void => {
    if (resumeGestureAttached) return;
    resumeGestureAttached = true;

    window.addEventListener("pointerdown", attemptResumeSharedAudioContext);
    window.addEventListener("keydown", attemptResumeSharedAudioContext);
};

// One instance per audio stream (local or remote): samples that stream's
// volume on an interval and only calls back when the speaking/not-speaking
// state actually flips (after being confirmed across
// REQUIRED_CONSECUTIVE_SAMPLES polls).
export class SpeakingDetector {
    private readonly onSpeakingChange: (isSpeaking: boolean) => void;
    private source: MediaStreamAudioSourceNode | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array<ArrayBuffer> | null = null;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isSpeaking = false;
    private pendingState: boolean | null = null;
    private pendingCount = 0;

    constructor({ onSpeakingChange }: SpeakingDetectorOptions) {
        this.onSpeakingChange = onSpeakingChange;
    }

    start(stream: MediaStream): void {
        this.stop();

        const audioContext = getSharedAudioContext();
        if (audioContext.state === "suspended") {
            attemptResumeSharedAudioContext();
            ensureResumeOnGesture();
        }

        const analyser = audioContext.createAnalyser();
        // Small on purpose: this only needs enough resolution to estimate
        // loudness for a boolean indicator, not to visualize a waveform, so
        // there's no reason to pay for the default 2048-sample analysis.
        analyser.fftSize = 256;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        this.source = source;
        this.analyser = analyser;
        // Explicit ArrayBuffer (not the default ArrayBufferLike) so this
        // matches getByteTimeDomainData's expected argument type.
        this.dataArray = new Uint8Array(new ArrayBuffer(analyser.fftSize));
        this.pendingState = null;
        this.pendingCount = 0;

        this.poll();
        this.intervalId = setInterval(this.poll, SPEAKING_POLL_INTERVAL_MS);
    }

    stop(): void {
        if (this.intervalId !== null) clearInterval(this.intervalId);
        this.intervalId = null;

        // Only this detector's own nodes are torn down - the AudioContext
        // itself is shared and stays open for every other detector using it.
        this.source?.disconnect();
        this.source = null;
        this.analyser = null;
        this.dataArray = null;

        this.setSpeaking(false);
    }

    private poll = (): void => {
        if (!this.analyser || !this.dataArray) return;

        this.analyser.getByteTimeDomainData(this.dataArray);
        this.registerSample(checkIsSpeaking(this.rms(), SPEAKING_THRESHOLD));
    };

    // getByteTimeDomainData centers silence at 128, not 0: each sample is
    // normalized to a -1..1 range around that midpoint before being
    // squared, so a silent stream reads as an RMS of 0 rather than ~128.
    // Rescaled back to 0-255 so SPEAKING_THRESHOLD stays in a familiar,
    // byte-like range.
    private rms(): number {
        const data = this.dataArray;
        if (!data) return 0;

        let sumOfSquares = 0;
        for (let i = 0; i < data.length; i++) {
            const normalized = (data[i] - 128) / 128;
            sumOfSquares += normalized * normalized;
        }

        return Math.sqrt(sumOfSquares / data.length) * 255;
    }

    private registerSample(sample: boolean): void {
        if (sample === this.isSpeaking) {
            this.pendingState = null;
            this.pendingCount = 0;
            return;
        }

        if (sample === this.pendingState) {
            this.pendingCount += 1;
        } else {
            this.pendingState = sample;
            this.pendingCount = 1;
        }

        if (this.pendingCount >= REQUIRED_CONSECUTIVE_SAMPLES) {
            this.setSpeaking(sample);
            this.pendingState = null;
            this.pendingCount = 0;
        }
    }

    private setSpeaking(isSpeaking: boolean): void {
        if (isSpeaking === this.isSpeaking) return;

        this.isSpeaking = isSpeaking;
        this.onSpeakingChange(isSpeaking);
    }
}
