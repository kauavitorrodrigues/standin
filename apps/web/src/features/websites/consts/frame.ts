// What the page of an embedded website may do inside the frame. Scripts, forms,
// popups and the like are allowed so the site works; top navigation, modals
// and downloads are not, so the site cannot take the app over. Scripts and the
// same origin are only safe together because the app origin is refused: a frame
// that ends up on it is closed (see `isFrameOnAppOrigin`).
export const WEBSITE_FRAME_SANDBOX = [
    "allow-scripts",
    "allow-same-origin",
    "allow-forms",
    "allow-popups",
    "allow-popups-to-escape-sandbox",
    "allow-presentation",
    "allow-pointer-lock",
].join(" ");

export const WEBSITE_FRAME_ALLOW =
    "clipboard-write; autoplay; fullscreen; picture-in-picture";

// What the site learns about where the request came from: the origin of the
// app and no more, and nothing at all over an insecure connection.
export const WEBSITE_FRAME_REFERRER_POLICY = "strict-origin-when-cross-origin";

// A frame that has not loaded by then shows the error state.
export const WEBSITE_FRAME_LOAD_TIMEOUT_MS = 15_000;
