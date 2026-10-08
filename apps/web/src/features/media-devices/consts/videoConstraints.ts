export const LOCAL_CAMERA_CONSTRAINTS: MediaTrackConstraints = {
    width: { ideal: 640 },
    height: { ideal: 360 },
    frameRate: { ideal: 24 },
};

// Capture is capped at 1080p: a 1440p or 4K monitor would otherwise hand the
// encoder several times more pixels per frame than it can keep up with on a
// modest machine, which stutters the share and the rest of the page with it.
// The encoder limits (see getVideoEncoding) then only have to tune bitrate.
export const LOCAL_SCREEN_CONSTRAINTS: MediaTrackConstraints = {
    width: { max: 1920 },
    height: { max: 1080 },
    frameRate: { ideal: 30, max: 30 },
};

// How long a screen share may run with nobody close enough to receive it
// before it is ended. Short walks away and back must not cost the share,
// but a capture nobody can see should not run (and keep the browser's
// "sharing" indicator on) indefinitely.
export const SCREEN_SHARE_IDLE_GRACE_MS = 60_000;
