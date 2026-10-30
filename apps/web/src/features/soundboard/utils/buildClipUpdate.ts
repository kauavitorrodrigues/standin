import type { SoundboardUpdateBody } from "@standin/contracts";
import type { ClipDraft } from "../types/clip";
import { clampVolume } from "./clampVolume";

/**
 * Only what changed, since the server needs at least one field and a clip
 * someone else renamed meanwhile should not be overwritten by a stale name.
 * Returns null when nothing changed. A cleared icon goes as null.
 */
export const buildClipUpdate = (
    clip: ClipDraft,
    draft: ClipDraft
): SoundboardUpdateBody | null => {
    const body: SoundboardUpdateBody = {};
    const name = draft.name.trim();
    const volume = clampVolume(draft.volume);

    if (name !== clip.name) body.name = name;
    if (draft.icon !== clip.icon) body.icon = draft.icon;
    if (volume !== clip.volume) body.volume = volume;

    if (Object.keys(body).length === 0) return null;
    return body;
};
