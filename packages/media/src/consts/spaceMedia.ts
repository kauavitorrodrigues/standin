import { MEDIA_SOURCES, type MediaSource } from "@standin/contracts";
import type {
    PlannerConfig,
    ProducerKind,
    SimulcastLayer,
} from "../planner/types";
import {
    LOW_QUALITY_CAROUSEL_SIZE,
    LOW_QUALITY_LOUDEST_SPEAKERS,
} from "./server";

// The planner names a stream by its kind, the signalling by its source.
export const PLANNER_KIND_OF_SOURCE: Record<MediaSource, ProducerKind> = {
    [MEDIA_SOURCES.MIC]: "audio",
    [MEDIA_SOURCES.CAMERA]: "camera",
    [MEDIA_SOURCES.SCREEN]: "screen",
    [MEDIA_SOURCES.SCREEN_AUDIO]: "screen-audio",
};

export const SOURCE_OF_PLANNER_KIND: Record<ProducerKind, MediaSource> = {
    audio: MEDIA_SOURCES.MIC,
    camera: MEDIA_SOURCES.CAMERA,
    screen: MEDIA_SOURCES.SCREEN,
    "screen-audio": MEDIA_SOURCES.SCREEN_AUDIO,
};

// The spatial layer of the simulcast camera each layer name stands for.
export const SPATIAL_LAYER: Record<SimulcastLayer, number> = {
    low: 0,
    mid: 1,
    high: 2,
};

// What a receiver on a weak machine changes in the planner.
export const LOW_QUALITY_PLANNER_CONFIG: Partial<PlannerConfig> = {
    carouselSize: LOW_QUALITY_CAROUSEL_SIZE,
    loudestSpeakers: LOW_QUALITY_LOUDEST_SPEAKERS,
};
