import { clampVolume } from "@/features/soundboard/utils/clampVolume";
import { MIXER_LIMITER } from "@/features/media-devices/consts/limiter";
import { GESTURE_EVENTS } from "@/features/media-devices/consts/gestureEvents";
import type { ClipStart } from "@/features/media-devices/types/clipStart";
import type { RunningPlay } from "@/features/media-devices/types/runningPlay";
import type { MicMixer } from "@/features/media-devices/types/micMixer";
import type { MixerContext } from "@/features/media-devices/types/mixerContext";
import type { RunningContext } from "@/features/media-devices/types/runningContext";

const detach = ({ source, gain }: RunningPlay): void => {
    source.onended = null;
    source.stop();
    source.disconnect();
    gain.disconnect();
};

// The clip goes through its own gain, which is how a loud clip is turned down
// for everyone who hears it, and from there to every output given. It is
// added to the plays that are running, which end each on their own.
const startPlay = (
    context: MixerContext,
    plays: Map<string, RunningPlay>,
    { playId, buffer, volume, onEnded }: ClipStart,
    outputs: readonly AudioNode[]
): void => {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = clampVolume(volume);
    source.connect(gain);
    outputs.forEach((output) => gain.connect(output));
    source.onended = () => {
        if (!plays.delete(playId)) return;
        source.disconnect();
        gain.disconnect();
        onEnded?.();
    };
    plays.set(playId, { source, gain });
    source.start();
};

const createLimiter = (context: MixerContext): DynamicsCompressorNode => {
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = MIXER_LIMITER.thresholdDb;
    limiter.knee.value = MIXER_LIMITER.kneeDb;
    limiter.ratio.value = MIXER_LIMITER.ratio;
    limiter.attack.value = MIXER_LIMITER.attackSeconds;
    limiter.release.value = MIXER_LIMITER.releaseSeconds;
    return limiter;
};

/**
 * Builds the graph that produces the published track:
 * microphone -> micGain -> destination, and every clip -> limiter ->
 * destination. The voice goes straight, as it did before there were clips, so
 * its quality is not touched. The destination stream is what goes to the media
 * server, so the clips ride the same audio track as the voice, and the limiter
 * keeps clips that overlap from clipping it, being only on them. A clip also
 * goes to the local speakers, so the person who plays it hears it too. That
 * copy never touches the limiter or the destination, so nobody else gets it
 * twice.
 */
export const createMicMixer = (
    context: MixerContext,
    micStream: MediaStream
): MicMixer => {
    const micSource = context.createMediaStreamSource(micStream);
    const micGain = context.createGain();
    const limiter = createLimiter(context);
    const destination = context.createMediaStreamDestination();
    micSource.connect(micGain);
    micGain.connect(destination);
    limiter.connect(destination);

    const plays = new Map<string, RunningPlay>();

    const resume = () => {
        if (context.state === "running") return;
        void context.resume().catch(() => undefined);
    };

    const stopClip = (playId: string) => {
        const play = plays.get(playId);
        if (!play) return;
        plays.delete(playId);
        // Stopped by hand, so its end is not reported.
        detach(play);
    };

    const stopAllClips = () => [...plays.keys()].forEach(stopClip);

    return {
        canMixClips: true,
        stream: destination.stream,
        setMicEnabled: (enabled) => {
            micGain.gain.value = enabled ? 1 : 0;
        },
        setPublishEnabled: (enabled) => {
            destination.stream
                .getAudioTracks()
                .forEach((track) => (track.enabled = enabled));
        },
        playClip: (start) => {
            resume();
            startPlay(context, plays, start, [limiter, context.destination]);
        },
        stopClip,
        stopAllClips,
        resume,
        dispose: () => {
            stopAllClips();
            micSource.disconnect();
            micGain.disconnect();
            limiter.disconnect();
            destination.stream.getTracks().forEach((track) => track.stop());
            micStream.getTracks().forEach((track) => track.stop());
            void context.close().catch(() => undefined);
        },
    };
};

/**
 * A context made without a user gesture starts suspended and would publish
 * silence, and the browser can suspend it again later (Safari reports
 * "interrupted" after a call or a lock screen). Resumes it now, and on the
 * first gesture if that is refused. Every state change that leaves it not
 * running arms the same recovery again. Returns the cleanup.
 */
export const keepContextRunning = (
    context: RunningContext,
    target: Pick<
        Document,
        "addEventListener" | "removeEventListener"
    > = document
): (() => void) => {
    const disarm = () =>
        GESTURE_EVENTS.forEach((event) =>
            target.removeEventListener(event, onGesture, true)
        );
    const onGesture = () => {
        disarm();
        void context.resume().catch(() => undefined);
    };
    const arm = () => {
        // A closed context cannot come back.
        if (context.state === "running" || context.state === "closed") return;
        void context.resume().catch(() => undefined);
        disarm();
        GESTURE_EVENTS.forEach((event) =>
            target.addEventListener(event, onGesture, true)
        );
    };

    context.addEventListener("statechange", arm);
    arm();
    return () => {
        context.removeEventListener("statechange", arm);
        disarm();
    };
};
