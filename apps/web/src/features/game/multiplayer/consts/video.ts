// A person shows on the stage when inside the enter radius and only stops
// once beyond the (larger) exit radius, so standing right at the boundary
// doesn't flip the tile on and off every few frames. The exit radius is the
// enter radius of the preset plus this margin. The server uses the same rule
// to decide who it sends video of.
export const VIDEO_EXIT_MARGIN_PX = 30;

// The most people listed on the stage at once. The server decides who is sent
// video and the carousel pages the tiles, so this only bounds the list.
export const STAGE_MAX_NEARBY_PEERS = 50;
