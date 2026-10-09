// How long a screen share may run with nobody close enough to receive it
// before it is ended. Short walks away and back must not cost the share,
// but a capture nobody can see should not run (and keep the browser's
// "sharing" indicator on) indefinitely.
export const SCREEN_SHARE_IDLE_GRACE_MS = 60_000;
