import { MAX_AUDIBLE_RADIUS } from "./audio";

// A peer starts receiving video when inside the enter radius and only stops
// once beyond the (larger) exit radius, so standing right at the boundary
// doesn't flip the stream on and off every few frames.
export const VIDEO_ENTER_RADIUS = MAX_AUDIBLE_RADIUS;
export const VIDEO_EXIT_RADIUS = MAX_AUDIBLE_RADIUS + 30;

// Upper bound on how many peers receive the local video at once (closest
// first). Every extra receiver is another full encode and upload in a mesh.
export const MAX_VIDEO_PEERS = 4;

export type VideoEncoding = {
    maxBitrate: number;
    maxFramerate: number;
    scaleResolutionDownBy: number;
};

// Starting values, to be tuned against real hardware and networks.
export const CAMERA_ENCODING_BASE: VideoEncoding = {
    maxBitrate: 600_000,
    maxFramerate: 24,
    scaleResolutionDownBy: 1,
};

export const CAMERA_ENCODING_FLOOR_BITRATE = 150_000;

// Full HD at 30 fps: smooth scrolling and cursor. The capture is tagged
// "motion" (see useLocalScreenShare), so under pressure the browser lowers
// resolution before frame rate; the bitrate here is what keeps text legible
// until it has to. This is the most a modest machine can be asked to encode
// for several receivers at once; 60 fps would roughly double that work.
export const SCREEN_ENCODING_BASE: VideoEncoding = {
    maxBitrate: 4_000_000,
    maxFramerate: 30,
    scaleResolutionDownBy: 1,
};

// Total upload budget for the screen across every receiver. The per-receiver
// bitrate is this divided by the number of receivers, and the floor is the
// budget split across the most receivers there can be, so the sum never goes
// over it.
export const SCREEN_TOTAL_BITRATE_BUDGET = 4_000_000;
export const SCREEN_ENCODING_FLOOR_BITRATE =
    SCREEN_TOTAL_BITRATE_BUDGET / MAX_VIDEO_PEERS;
