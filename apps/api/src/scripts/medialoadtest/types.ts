import type { Fanout } from "./utils/createFanout";
import type { Layout } from "./utils/arrange";

export type MediaRunOptions = {
    people: number;
    speakers: number;
    cameras: number;
    screens: number;
    layout: Layout;
    durationSec: number;
    rng: () => number;
    // One video layer, or three like a real camera.
    layers: 1 | 3;
    // Full HD sizes for the three layers.
    fullHd: boolean;
    // With one layer, the quality of the feed every camera sends, from the
    // three layer sizes. Null keeps the default picture.
    quality: "low" | "mid" | "high" | null;
    // The layer every receiver asks for the cameras it can see, or null to
    // leave them all on the low layer.
    view: "low" | "mid" | "high" | null;
};

/** The SSRC of each stream a synthetic person sends, or null when they send none. */
export type PersonStreams = {
    mic: number | null;
    // One SSRC per video layer.
    camera: number[] | null;
    screen: number | null;
};

/** The fan-outs that copy the ffmpeg feeds to every synthetic sender. */
export type Feeds = {
    audio: Fanout | null;
    // One fan-out per video layer, empty when nobody sends video.
    video: Fanout[];
    stop: () => void;
};
