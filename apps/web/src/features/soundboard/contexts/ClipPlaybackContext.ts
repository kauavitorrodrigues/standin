import { createContext } from "react";
import type { ClipPlayback } from "../types/playback";

// How the tiles of a screen play: into the call, or to the speakers.
export const ClipPlaybackContext = createContext<ClipPlayback | null>(null);
