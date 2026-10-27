// How often a walking bot sends its position. The client throttles to 80 ms,
// about 12.5 updates a second (SEND_INTERVAL_MS).
export const SEND_INTERVAL_MS = 80;

// Walking speed of the avatar, px per second. Same as PLAYER_PHYSICS.SPEED in
// apps/web/src/features/game/consts/player.ts.
export const WALK_SPEED_PX_PER_SEC = 220;

// The side of the plain square the bots walk in when there is no map to read,
// which is only the case in tests. A real run walks on the map of the space.
export const ARENA_SIZE_PX = 2000;

// How long a bot holds one key before it changes direction or stops, and how
// long it stands still between two walks.
export const KEY_HOLD_MIN_MS = 300;
export const KEY_HOLD_MAX_MS = 1500;
export const IDLE_MIN_MS = 500;
export const IDLE_MAX_MS = 3000;

// Share of the walks that are a click on a far point instead of held keys.
export const CLICK_WALK_CHANCE = 0.5;

// Each bot says something near and floats an emote at a random delay inside
// these windows. Well under the rate limits of both events.
export const NEARBY_MESSAGE_MIN_MS = 4000;
export const NEARBY_MESSAGE_MAX_MS = 10000;
export const EMOTE_MIN_MS = 5000;
export const EMOTE_MAX_MS = 12000;
export const BOT_EMOJIS = ["👍", "😂", "🎉", "👋", "❤️"];

export const JOIN_TIMEOUT_MS = 10000;
export const CONNECT_TIMEOUT_MS = 10000;
export const RSS_SAMPLE_INTERVAL_MS = 1000;
// How often a run prints how it is going, so a long run is not silent.
export const PROGRESS_INTERVAL_MS = 5000;
// Lets the server handle the disconnects of a run before the next one starts.
export const BETWEEN_RUNS_MS = 1500;

export const DEFAULT_URL = "http://localhost:3001";
export const DEFAULT_WALKING_PERCENT = 70;
export const DEFAULT_DURATION_SEC = 20;

export const BOT_EMAIL_DOMAIN = "loadtest.standin.test";
