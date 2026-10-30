import type { TrimEdgeConfig } from "../types/trim";

// The two edges of the selection, with how each one is named to the person.
export const TRIM_EDGES: readonly TrimEdgeConfig[] = [
    { edge: "startMs", handleLabel: "Início do trecho" },
    { edge: "endMs", handleLabel: "Fim do trecho" },
];

// How far an arrow key moves the focused handle, and with shift held.
export const SOUNDBOARD_HANDLE_STEP_MS = 100;
export const SOUNDBOARD_HANDLE_BIG_STEP_MS = 1000;
