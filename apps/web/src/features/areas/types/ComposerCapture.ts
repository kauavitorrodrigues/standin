import type { TileRect } from "@/features/editor/types/tile-rect";

// Takes the PNG of the frame at native resolution.
export type ComposerCapture = (rect: TileRect) => Promise<Blob>;
