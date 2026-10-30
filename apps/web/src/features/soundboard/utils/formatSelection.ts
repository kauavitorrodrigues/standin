import { toSeconds } from "@/utils/toSeconds";

/** 5150 -> "5.15s", the length of the selection under the play button. */
export const formatSelection = (ms: number): string => `${toSeconds(ms)}s`;
