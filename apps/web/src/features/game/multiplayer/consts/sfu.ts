import type { types } from "mediasoup-client";
import type { ScreenResolutionTier } from "@/features/media-devices/consts/streamingSettings";

// Three simulcast layers for a camera, in the order low, mid, high. The server
// forwards the low one to everybody and the mid or high one only to who sees
// the person in a tile big enough for it.
export const CAMERA_SIMULCAST_ENCODINGS: types.RtpEncodingParameters[] = [
    {
        rid: "low",
        maxBitrate: 150_000,
        scaleResolutionDownBy: 4,
        maxFramerate: 15,
    },
    {
        rid: "mid",
        maxBitrate: 500_000,
        scaleResolutionDownBy: 2,
        maxFramerate: 24,
    },
    {
        rid: "high",
        maxBitrate: 2_000_000,
        scaleResolutionDownBy: 1,
        maxFramerate: 24,
    },
];

// The same three layers for a full HD capture. The sharp layer has the frame
// rate and a bitrate in the range other call apps use for full HD.
export const CAMERA_FULL_HD_SIMULCAST_ENCODINGS: types.RtpEncodingParameters[] =
    [
        {
            rid: "low",
            maxBitrate: 200_000,
            scaleResolutionDownBy: 4,
            maxFramerate: 15,
        },
        {
            rid: "mid",
            maxBitrate: 900_000,
            scaleResolutionDownBy: 2,
            maxFramerate: 30,
        },
        {
            rid: "high",
            maxBitrate: 3_500_000,
            scaleResolutionDownBy: 1,
            maxFramerate: 30,
        },
    ];

// A capture taller than this many pixels is sent with the full HD layers.
export const CAMERA_FULL_HD_ABOVE_PX = 800;

// A screen share is one layer. Its bitrate follows the resolution tier of the
// capture, from 1.5 to 2.5 Mbps. The notes on the reference do not document
// the send bitrate, so these values are our own.
export const SCREEN_BITRATE_BY_TIER = {
    LOW: 1_500_000,
    MED: 2_000_000,
    HIGH: 2_500_000,
} as const satisfies Record<ScreenResolutionTier, number>;

// Used when the track does not report its frame rate.
export const SCREEN_DEFAULT_FRAME_RATE = 15;

// The tier of a capture is read from its larger side, in pixels. Above the
// MED box it is HIGH, above the LOW box it is MED.
export const SCREEN_TIER_MED_ABOVE_PX = 1280;
export const SCREEN_TIER_HIGH_ABOVE_PX = 1920;

export const MIC_CODEC_OPTIONS: types.ProducerCodecOptions = {
    opusDtx: true,
    opusFec: true,
};

// How long a request to the server may wait for its answer.
export const SFU_REQUEST_TIMEOUT_MS = 8000;

// The media session is built again at most this many times in the window of
// AttemptRateTracker before the client gives up and waits for the next join.
export const SFU_REBUILD_MAX_ATTEMPTS = 6;
