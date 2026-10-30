/** Where a point of the source falls along the waveform, as a CSS percent. */
export const percentOf = (ms: number, durationMs: number): string =>
    `${(ms / durationMs) * 100}%`;
