import {
    AUDIO_BITRATE,
    AUDIO_FEED_PORT,
    OPUS_PAYLOAD_TYPE,
    VP8_PAYLOAD_TYPE,
    type VideoFeedSpec,
} from "../consts";

const RTP_PACKET_BYTES = 1200;

/** One Opus tone, sent as RTP to the audio feed port. */
export const buildAudioFeedArgs = (): string[] => [
    "-re",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:sample_rate=48000",
    "-c:a",
    "libopus",
    "-b:a",
    AUDIO_BITRATE,
    "-ac",
    "2",
    "-payload_type",
    String(OPUS_PAYLOAD_TYPE),
    "-f",
    "rtp",
    `rtp://127.0.0.1:${AUDIO_FEED_PORT}?pkt_size=${RTP_PACKET_BYTES}`,
];

/** One moving test picture in VP8, sent as RTP to the port of its layer. */
export const buildVideoFeedArgs = ({
    port,
    size,
    bitrate,
    fps,
}: VideoFeedSpec): string[] => [
    "-re",
    "-f",
    "lavfi",
    "-i",
    `testsrc2=size=${size}:rate=${fps}`,
    "-c:v",
    "libvpx",
    "-b:v",
    bitrate,
    "-deadline",
    "realtime",
    "-cpu-used",
    "8",
    "-g",
    String(fps * 2),
    "-payload_type",
    String(VP8_PAYLOAD_TYPE),
    "-f",
    "rtp",
    `rtp://127.0.0.1:${port}?pkt_size=${RTP_PACKET_BYTES}`,
];
