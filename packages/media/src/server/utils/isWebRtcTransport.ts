import type { types } from "mediasoup";

/**
 * Whether a transport is a WebRTC one. Plain transports, used by the tools and
 * tests that feed RTP from a local process, have no ICE to restart.
 */
export const isWebRtcTransport = (
    transport: types.Transport
): transport is types.WebRtcTransport => "restartIce" in transport;
