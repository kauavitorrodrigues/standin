import {
    AMBIENT_RANGES,
    type AmbientRange,
    type ProximityPreset,
} from "@standin/contracts";

// Every tunable of the subscription planner lives here, so a value is a
// one-line change.

// Loudest speakers that get an audio consumer at once. Sizing is a
// starting value for rooms of tens of people.
export const LOUDEST_SPEAKERS = 4;

// Video tiles a person sees at once. A camera and a screen are separate entries.
export const CAROUSEL_SIZE = 2;

// Margin between the enter and the exit radius, so a person standing on the
// boundary does not flip in and out. The enter radius is the hard cutoff of the
// proximity preset of the space (see radiiForPreset).
export const RADIUS_HYSTERESIS_PX = 30;

// The proximity curves are in tiles.
export const PX_PER_TILE = 32;

// Default curve, the "Long" preset.
export const PROXIMITY_PRESET: ProximityPreset = "Long";

// A video consumer whose video magnitude is at or below this is paused, the
// "near zero means pause" use of the magnitude (isMediaRequestedFrom).
// With the "Long" curve and its 414 px exit radius the video magnitude stays
// far above this value, so inside the radius it never pauses. It only
// applies when a magnitude rule lowers the video magnitude (for example a
// future focus mode or a dimmed area), which is why it is kept.
export const VIDEO_PAUSE_MAGNITUDE = 0.05;

// Minimum time between changes for one receiver, 4 Hz at most.
export const MIN_CHANGE_INTERVAL_MS = 250;

// The planner has no ambient ring unless the caller asks for one. A space
// passes its own range (short by default, see DEFAULT_AMBIENT_RANGE), so a
// caller that passes nothing keeps the proximity ring only.
export const AMBIENT_RANGE: AmbientRange = AMBIENT_RANGES.OFF;

// Voices a receiver overhears at once from the ambient ring, on top of the
// loudest speakers of the proximity ring. Few on purpose: it is a murmur.
export const AMBIENT_LISTENERS = 3;

// The audio magnitude an ambient pair enters the magnitude rules with: a plain
// marker, since the rules only keep it or cut it to 0. The volume itself is
// set by the client from the distance.
export const AMBIENT_MAGNITUDE = 1;
