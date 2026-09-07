// How long a "typing" state is kept visible after the last keystroke (or the
// last peer typing:true broadcast received) before it's assumed stale and
// cleared. A stopped-typing broadcast can be lost like any other P2P frame,
// so this is the fallback that prevents an indicator from getting stuck.
export const TYPING_EXPIRY_MS = 4000;

// How long to wait after the last keystroke before broadcasting typing:false
// from the composer. Shorter than TYPING_EXPIRY_MS since this is the normal
// "stopped typing" signal, not the fallback for a lost one.
export const TYPING_STOP_DELAY_MS = 2000;

// Beyond this, TypingIndicator's avatar group only shows the overflow count
// instead of one more avatar, same idea as WhatsApp's typing indicator.
export const MAX_VISIBLE_TYPING_AVATARS = 3;
