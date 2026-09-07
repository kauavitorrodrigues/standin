import type { ConversationMessagesListResponse } from "@standin/contracts";

// How close to the top of the viewport the user has to scroll before the
// previous page of messages starts loading.
export const LOAD_MORE_SCROLL_THRESHOLD_PX = 200;

export const MESSAGE_TIME_FORMAT = "HH:mm";

// Marks a message that only exists locally while its request is in flight,
// so the server response can replace exactly that entry afterwards.
export const OPTIMISTIC_MESSAGE_ID_PREFIX = "optimistic-";

// Marks a message that only exists locally because it arrived over the P2P
// mesh, not yet the persisted row from the API. Reconciled to the real id
// by a CONFIRM broadcast once the sender's own API call resolves, the same
// way OPTIMISTIC_MESSAGE_ID_PREFIX is reconciled for the sender's own
// message.
export const PEER_MESSAGE_ID_PREFIX = "peer-";

export const EMPTY_MESSAGES_PAGE: ConversationMessagesListResponse = {
    messages: [],
    users: {},
    nextCursor: null,
};

// Newly arrived messages rise from below their final position and fade in,
// matching the direction new rows grow in. Only transform and opacity are
// animated, so the scroller's row measurement stays predictable and
// auto-scroll/anchoring never fights a changing layout. Each target carries
// its own `transition` rather than a shared top-level prop, so enter and
// exit keep their own timing.
export const NEW_MESSAGE_ENTER_INITIAL = { opacity: 0, y: 16 };
export const NEW_MESSAGE_ENTER_ANIMATE = {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
} as const;

// Same rise-and-fade entrance as above, but as a Tailwind class list for
// elements that always fully mount/unmount, like the typing indicator
// bubble.
export const NEW_MESSAGE_ENTRANCE_CLASSES =
    "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out";

// A deleted message pops out instead of vanishing instantly: a quick
// shrink plus fade, mirroring (in reverse) the rise-and-fade entrance
// above so removal reads as the same kind of motion as arrival.
export const MESSAGE_EXIT = {
    opacity: 0,
    scale: 0.85,
    transition: { duration: 0.2, ease: "easeIn" },
} as const;

// A message row's own inner content is keyed by editedAt (falling back to
// this constant for a never-edited message) so a live edit can remount
// just that inner wrapper and replay the entrance animation, without the
// remount being mistaken by AnimatePresence for the row itself being
// removed and re-added.
export const MESSAGE_ORIGINAL_CONTENT_KEY = "original";

// Reaction pills pop in/out individually, and the whole row rises/collapses
// with the first/last reaction, instead of just popping into or out of
// existence.
const REACTION_TRANSITION = { duration: 0.15, ease: "easeOut" } as const;
export const REACTION_PILL_INITIAL = { opacity: 0, scale: 0.6 };
export const REACTION_PILL_ANIMATE = {
    opacity: 1,
    scale: 1,
    transition: REACTION_TRANSITION,
} as const;
export const REACTION_PILL_EXIT = {
    opacity: 0,
    scale: 0.6,
    transition: REACTION_TRANSITION,
} as const;
export const REACTION_ROW_INITIAL = { opacity: 0, height: 0 };
export const REACTION_ROW_ANIMATE = {
    opacity: 1,
    height: "auto",
    transition: REACTION_TRANSITION,
} as const;
export const REACTION_ROW_EXIT = {
    opacity: 0,
    height: 0,
    transition: REACTION_TRANSITION,
} as const;

// AnimatePresence needs a stable key for the reaction row itself (the row
// mounts/unmounts as a whole with the first/last reaction, separately from
// each pill inside it), even though only one ever renders per message.
export const REACTION_ROW_KEY = "reaction-pills";
