import {
    FPS_LIMITS,
    VIDEO_PEER_LIMITS,
    type PerformanceSettings,
} from "@/features/settings/performance/consts/performanceSettings";

export const getFpsLimit = ({ fpsLimit }: PerformanceSettings): number =>
    FPS_LIMITS[fpsLimit];

export const getMaxVideoPeers = ({
    maxVideoPeers,
}: PerformanceSettings): number => VIDEO_PEER_LIMITS[maxVideoPeers];
