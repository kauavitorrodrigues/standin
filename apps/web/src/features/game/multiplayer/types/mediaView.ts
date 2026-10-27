import type { MEDIA_VIEW_LAYERS } from "@standin/contracts";

export type MediaViewLayer = (typeof MEDIA_VIEW_LAYERS)[number];

// A person the local user sees large enough to need more than the low layer.
export type MediaView = { userId: string; layer: MediaViewLayer };
