import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardLibrary } from "../types/library";

// The library of an organization: its clips first, then the default ones, and
// what is uploaded is the organization's.
export const ORGANIZATION_LIBRARY: SoundboardLibrary = {
    kind: "organization",
    scopes: [
        SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
        SOUNDBOARD_CLIP_SCOPES.DEFAULT,
    ],
    uploadScope: SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
    showGroupHeaders: true,
};

// The page of the organization: only its own clips, in one list with no group
// header. The default clips are not fetched here.
export const ORGANIZATION_PAGE_LIBRARY: SoundboardLibrary = {
    kind: "organization",
    scopes: [SOUNDBOARD_CLIP_SCOPES.ORGANIZATION],
    uploadScope: SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
    showGroupHeaders: false,
};

// The page of the platform admin: only the default clips, in one list with no
// group header, and what is uploaded is a default clip.
export const ADMIN_PAGE_LIBRARY: SoundboardLibrary = {
    kind: "admin",
    scopes: [SOUNDBOARD_CLIP_SCOPES.DEFAULT],
    uploadScope: SOUNDBOARD_CLIP_SCOPES.DEFAULT,
    showGroupHeaders: false,
};

// The part of the query key of the clips that no organization has.
export const GLOBAL_LIBRARY_CACHE_KEY = "global";
