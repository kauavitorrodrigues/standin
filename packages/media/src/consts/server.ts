import type { types } from "mediasoup";

// Codecs the router of a space accepts. Opus for audio, VP8 for camera and
// screen so every browser can send and receive with simulcast, and H264 as the
// second choice for browsers that prefer it.
export const MEDIA_CODECS: types.RouterRtpCodecCapability[] = [
    {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: { "x-google-start-bitrate": 500 },
    },
    {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 500,
        },
    },
];

// One worker serves the whole API process, decision D1.
export const DEFAULT_MEDIA_WORKERS = 1;
export const DEFAULT_MEDIA_LISTEN_IP = "0.0.0.0";
export const DEFAULT_MEDIA_LISTEN_PORT = 44444;

// Bitrate the server allows a person to send in total, in bps. A camera is
// simulcast with three layers of about 2.65 Mbps together and a screen is a
// single layer of up to 2.5 Mbps. The limit leaves room for retransmissions
// and bandwidth probing on top of both, and only stops a client that sends far
// more than it should.
export const MAX_INCOMING_BITRATE = 10_000_000;
export const INITIAL_OUTGOING_BITRATE = 800_000;

// Loudest speakers kept by the audio level observer of a router, how loud a
// producer has to be to count (dBvo) and how often the ranking is reported.
export const SPEAKER_MAX_ENTRIES = 8;
export const SPEAKER_THRESHOLD_DB = -60;
export const SPEAKER_INTERVAL_MS = 400;

// Receivers on a weak machine get the low layer, one video playing and fewer
// voices. The other videos of the carousel wait paused, so their tiles can say
// why and play again as soon as the machine recovers.
export const LOW_QUALITY_ACTIVE_VIDEOS = 1;
export const LOW_QUALITY_LOUDEST_SPEAKERS = 2;

// When the worker is short of CPU the server holds back the videos that matter
// least. The share is of one core, which is what the worker can use. It starts
// above HIGH for HOLD_MS, holds back one more video for each HOLD_MS it stays
// there, and gives one back for each HOLD_MS spent below LOW. Between the two
// nothing changes, so the load does not make it flicker.
export const SERVER_LOAD = {
    HIGH_CPU_SHARE: 0.85,
    LOW_CPU_SHARE: 0.7,
    HOLD_MS: 10_000,
    // As many as a receiver can hold at once, which is the carousel.
    MAX_SHED: 2,
} as const;

// A video stream nobody receives is kept going for this long before its sender
// is told to stop encoding, so walking in and out of range does not make the
// camera start and stop again and again.
export const DEMAND_IDLE_MS = 3000;

// How often the media server writes its usage to the log.
export const MEDIA_TELEMETRY_INTERVAL_MS = 60_000;
