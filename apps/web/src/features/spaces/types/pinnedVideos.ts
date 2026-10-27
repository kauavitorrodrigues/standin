export type PinnedVideo = {
    tileId: string;
    // Epoch milliseconds. The smallest one is evicted first.
    pinnedAt: number;
};
