import type { SoundboardClipRow } from "./types";
import { findVisibleClip } from "./utils/findClip";

/**
 * The clip a person asks to play, or a not found error. The organization is
 * the one of the space they are in, so a clip of another organization is never
 * found. Used by the realtime handler, which trusts nothing from the client.
 */
export const findPlayableClip = (
    id: string,
    organizationId: string
): Promise<SoundboardClipRow> => findVisibleClip(id, organizationId);
