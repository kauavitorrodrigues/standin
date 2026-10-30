import { createContext } from "react";
import type { ClipPreview } from "../types/playback";

// The local listening of a screen, shared by all its tiles so that previewing
// one clip stops the one before it.
export const ClipPreviewContext = createContext<ClipPreview | null>(null);
