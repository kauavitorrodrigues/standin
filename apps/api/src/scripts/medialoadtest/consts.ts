// Settings of the media validation script. Everything runs in one process: a
// real media worker, the real rooms and planner, and synthetic people whose
// audio and video come from ffmpeg.

export const MEDIA_TEST_LISTEN_IP = "127.0.0.1";
export const MEDIA_TEST_PORT = 44777;

// Payload types of the synthetic streams, fixed so the feed and the producers
// agree without negotiating.
export const OPUS_PAYLOAD_TYPE = 111;
export const VP8_PAYLOAD_TYPE = 96;

// Where ffmpeg sends its RTP on the loopback. The fan-out listens here and
// copies every packet to each synthetic producer under its own SSRC.
export const AUDIO_FEED_PORT = 45010;
export const VIDEO_FEED_PORT = 45012;

export const AUDIO_BITRATE = "32k";

// One ffmpeg per video layer feeds every camera, and a screen uses the last
// one. A single layer is the old setup, three match the simulcast of a real
// camera. Each entry is a feed port, a size, a bitrate and a frame rate.
export type VideoFeedSpec = {
    port: number;
    size: string;
    bitrate: string;
    fps: number;
};

export const SINGLE_LAYER_FEEDS: VideoFeedSpec[] = [
    { port: VIDEO_FEED_PORT, size: "640x360", bitrate: "500k", fps: 24 },
];

export const THREE_LAYER_FEEDS: VideoFeedSpec[] = [
    { port: VIDEO_FEED_PORT, size: "320x180", bitrate: "150k", fps: 15 },
    { port: 45014, size: "640x360", bitrate: "500k", fps: 24 },
    { port: 45016, size: "1280x720", bitrate: "2000k", fps: 24 },
];

export const FULL_HD_THREE_LAYER_FEEDS: VideoFeedSpec[] = [
    { port: VIDEO_FEED_PORT, size: "480x270", bitrate: "200k", fps: 15 },
    { port: 45014, size: "960x540", bitrate: "900k", fps: 30 },
    { port: 45016, size: "1920x1080", bitrate: "3500k", fps: 30 },
];

// The first SSRC handed out. Each producer gets the next one.
export const FIRST_SSRC = 10_000;

// The planner is asked about every receiver this often, like the API does.
export const TICK_MS = 250;
// A line with the memory and the counts. Raised for the long soak.
export const REPORT_INTERVAL_MS = 30_000;

// How far a walking person moves each tick, in px, and the side of the area.
export const WALK_STEP_PX = 40;
export const DENSE_AREA_PX = 100;
export const SPREAD_AREA_PX = 3000;

export const DEFAULT_SPEAKERS = 10;
export const DEFAULT_CAMERAS = 4;
export const DEFAULT_SCREENS = 0;
export const DEFAULT_PEOPLE = 20;
export const DEFAULT_DURATION_SEC = 20;
