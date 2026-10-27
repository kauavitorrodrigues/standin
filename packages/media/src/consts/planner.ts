import type { ProximityPreset } from "@standin/contracts";

// Every tunable of the subscription planner lives here, so a value is a
// one-line change.

// Loudest speakers that get an audio consumer at once. Sizing is a
// starting value for rooms of tens of people.
export const LOUDEST_SPEAKERS = 4;

// Video tiles a person sees at once. A camera and a screen are separate entries.
export const CAROUSEL_SIZE = 2;

// Same pixel values as apps/web/src/features/game/multiplayer/consts/video.ts
// (VIDEO_ENTER_RADIUS = MAX_AUDIBLE_RADIUS, VIDEO_EXIT_RADIUS = +30). A
// person is picked up inside the enter radius and only dropped beyond the
// exit radius.
export const AUDIO_ENTER_RADIUS = 120;
export const AUDIO_EXIT_RADIUS = 150;
export const VIDEO_ENTER_RADIUS = 120;
export const VIDEO_EXIT_RADIUS = 150;

// The proximity curves are in tiles.
export const PX_PER_TILE = 32;

// Default curve, the "Long" preset.
export const PROXIMITY_PRESET: ProximityPreset = "Long";

// A video consumer whose video magnitude is at or below this is paused, the
// "near zero means pause" use of the magnitude (isMediaRequestedFrom).
export const VIDEO_PAUSE_MAGNITUDE = 0.05;

// Minimum time between changes for one receiver, 4 Hz at most.
export const MIN_CHANGE_INTERVAL_MS = 250;
