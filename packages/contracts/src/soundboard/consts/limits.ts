// The longest clip after trimming (milliseconds).
export const SOUNDBOARD_MAX_DURATION_MS = 10_000;

// The encoder pads the last frame and adds a delay, so a selection of exactly
// the maximum stores a few milliseconds more. The server allows this much.
export const SOUNDBOARD_DURATION_TOLERANCE_MS = 100;

// Shorter than this is a click, not a clip.
export const SOUNDBOARD_MIN_DURATION_MS = 100;

// The largest stored clip.
export const SOUNDBOARD_MAX_CLIP_BYTES = 512 * 1024;

// The largest source file the editor loads, since the browser decodes it whole.
export const SOUNDBOARD_MAX_SOURCE_BYTES = 10 * 1024 * 1024;

export const SOUNDBOARD_NAME_MAX = 40;

// Longest icon (UTF-16 units). One icon can be a long ZWJ sequence.
export const SOUNDBOARD_ICON_MAX_LENGTH = 16;

// Playback volume of a clip, as a fraction of its recorded level.
export const SOUNDBOARD_VOLUME_MIN = 0;
export const SOUNDBOARD_VOLUME_MAX = 1;
export const SOUNDBOARD_VOLUME_DEFAULT = 1;

// The wait between two plays of the same person, enforced by the server. It is
// short: it only stops a flood of clicks, since clips may overlap.
export const SOUNDBOARD_COOLDOWN_MS = 400;

// How many clips one person may have playing at the same time.
export const SOUNDBOARD_MAX_CONCURRENT_CLIPS = 4;

export const SOUNDBOARD_DEFAULT_PAGE_SIZE = 40;
export const SOUNDBOARD_MAX_PAGE_SIZE = 100;

// Multipart field names of the clip upload.
export const SOUNDBOARD_UPLOAD_FIELDS = {
    file: "file",
    name: "name",
    icon: "icon",
    volume: "volume",
} as const;
