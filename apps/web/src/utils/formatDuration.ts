/** 3200 -> "3,2 s", the way the panel and the editor show a length. */
export const formatDuration = (ms: number): string =>
    `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
