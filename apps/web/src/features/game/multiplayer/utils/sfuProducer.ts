import type { SfuSource } from "../types/sfu";
import {
    CAMERA_FULL_HD_ABOVE_PX,
    CAMERA_FULL_HD_SIMULCAST_ENCODINGS,
    CAMERA_SIMULCAST_ENCODINGS,
    MIC_CODEC_OPTIONS,
    SCREEN_BITRATE_BY_TIER,
    SCREEN_DEFAULT_FRAME_RATE,
    SCREEN_TIER_HIGH_ABOVE_PX,
    SCREEN_TIER_MED_ABOVE_PX,
} from "../consts/sfu";
import type { types } from "mediasoup-client";
import type { ScreenResolutionTier } from "@/features/media-devices/consts/streamingSettings";

type ProduceOptions = Pick<
    types.ProducerOptions,
    "encodings" | "codecOptions" | "stopTracks"
>;

/**
 * The tier of a capture, from the size the browser really gave after the
 * constraints were applied.
 */
export const screenTierForSize = (
    width: number | undefined,
    height: number | undefined
): ScreenResolutionTier => {
    const side = Math.max(width ?? 0, height ?? 0);
    if (side > SCREEN_TIER_HIGH_ABOVE_PX) return "HIGH";
    if (side > SCREEN_TIER_MED_ABOVE_PX) return "MED";
    return "LOW";
};

/**
 * The single layer a screen is sent with: the bitrate follows the tier and the
 * frame rate follows what the track delivers.
 */
export const screenEncodingsFor = (
    tier: ScreenResolutionTier,
    frameRate: number | undefined
): types.RtpEncodingParameters[] => {
    const hasFrameRate = frameRate !== undefined && frameRate > 0;
    return [
        {
            maxBitrate: SCREEN_BITRATE_BY_TIER[tier],
            maxFramerate: hasFrameRate
                ? Math.round(frameRate)
                : SCREEN_DEFAULT_FRAME_RATE,
        },
    ];
};

const screenEncodingsForTrack = (
    track: MediaStreamTrack | undefined
): types.RtpEncodingParameters[] => {
    const settings = track?.getSettings?.();
    return screenEncodingsFor(
        screenTierForSize(settings?.width, settings?.height),
        settings?.frameRate
    );
};

const cameraEncodingsFor = (
    track: MediaStreamTrack | undefined
): types.RtpEncodingParameters[] => {
    const height = track?.getSettings?.().height ?? 0;
    return height > CAMERA_FULL_HD_ABOVE_PX
        ? CAMERA_FULL_HD_SIMULCAST_ENCODINGS
        : CAMERA_SIMULCAST_ENCODINGS;
};

/**
 * Which set of encodings a track is sent with. A producer keeps the encodings
 * it was made with, so when this changes for a source the producer has to be
 * made again.
 */
export const encodingTierOf = (
    source: SfuSource,
    track: MediaStreamTrack
): string =>
    source === "camera"
        ? cameraEncodingsFor(track) === CAMERA_FULL_HD_SIMULCAST_ENCODINGS
            ? "camera-full-hd"
            : "camera"
        : source;

/**
 * How each source is sent. A camera is simulcast, a screen is one layer sized
 * by the tier of its track and the microphone uses discontinuous transmission.
 */
export const produceOptionsFor = (
    source: SfuSource,
    track?: MediaStreamTrack
): ProduceOptions => {
    switch (source) {
        case "camera":
            return { encodings: cameraEncodingsFor(track), stopTracks: false };
        case "screen":
            return { encodings: screenEncodingsForTrack(track), stopTracks: false };
        case "mic":
            return { codecOptions: MIC_CODEC_OPTIONS, stopTracks: false };
        default:
            return { stopTracks: false };
    }
};

/**
 * Gives the browser the hint that helps its encoder: music for the audio of a
 * screen. The hint of the screen video is set at capture, from the user's
 * screen share settings, and is left alone here.
 */
export const applyContentHint = (
    source: SfuSource,
    track: MediaStreamTrack
): void => {
    if (source === "screen-audio") track.contentHint = "music";
};
