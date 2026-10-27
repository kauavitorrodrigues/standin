import type { MediaRtpParameters } from "@standin/media";
import { OPUS_PAYLOAD_TYPE, VP8_PAYLOAD_TYPE } from "../consts";

/** What a synthetic microphone declares to the server. */
export const buildAudioParameters = (ssrc: number): MediaRtpParameters => ({
    codecs: [
        {
            mimeType: "audio/opus",
            payloadType: OPUS_PAYLOAD_TYPE,
            clockRate: 48000,
            channels: 2,
            parameters: {},
        },
    ],
    encodings: [{ ssrc }],
});

/**
 * What a synthetic camera or screen declares to the server: one encoding per
 * SSRC, so three of them make a simulcast camera.
 */
export const buildVideoParameters = (
    ssrcs: number[]
): MediaRtpParameters => ({
    codecs: [
        {
            mimeType: "video/VP8",
            payloadType: VP8_PAYLOAD_TYPE,
            clockRate: 90000,
            parameters: {},
        },
    ],
    encodings: ssrcs.map((ssrc) => ({ ssrc })),
});
