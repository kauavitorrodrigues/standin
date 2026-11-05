// A player makes at most one step sound in this time, so the cadence is the
// same at any frame rate. The first step of a walk sounds at once.
export const FOOTSTEP_THROTTLE_MS = 214;

// Remote steps are heard from this far, in tiles. The proximity preset of the
// space can shorten it, never widen it.
export const FOOTSTEP_REACH_TILES = 9;

// Steps sit under voices and notifications, so the curve is scaled down.
export const FOOTSTEP_VOLUME_SCALE = 0.8;

// Takes of each material, `<material>/<material>-01.mp3` to `<material>-17.mp3`. Keep in
// step with the files of apps/web/public/sounds/footsteps.
export const FOOTSTEP_TAKE_COUNT = 17;

export const FOOTSTEP_SOUNDS_PATH = "/sounds/footsteps";

// The id of the local player in the picker, apart from any socket id.
export const FOOTSTEP_LOCAL_ID = "local";
