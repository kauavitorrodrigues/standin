import {
    FPS_LIMITS,
    type PerformanceSettings,
} from "@/features/settings/performance/consts/performanceSettings";

export const getFpsLimit = ({ fpsLimit }: PerformanceSettings): number =>
    FPS_LIMITS[fpsLimit];

