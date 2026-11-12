export const DEFAULT_API_URL = "http://localhost:3001";
export const DEFAULT_WEB_URL = "http://localhost:5173";
export const DEFAULT_CHROME_PATH = "/usr/bin/google-chrome-stable";
export const DEFAULT_RUNS = 5;
export const DEFAULT_DURATION_SEC = 30;

// Time after the last client joined before the first snapshot, so the
// transports are up and the first frames are decoded.
export const DEFAULT_SETTLE_SEC = 15;

// Gap between two joins, so they do not pile up on the CPU of one machine.
export const JOIN_STAGGER_MS = 500;
export const PAGE_READY_TIMEOUT_MS = 30000;
export const BETWEEN_RUNS_MS = 3000;

// Fake devices feed a test picture and a beep, so no real camera is needed.
export const CHROME_ARGS = [
    "--no-sandbox",
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--autoplay-policy=no-user-gesture-required",
];

// The aria labels of the bottom bar buttons, in their two states.
export const CAMERA_LABELS = { off: "Ativar câmera", on: "Desativar câmera" };
export const MIC_LABELS = {
    off: "Ativar microfone",
    on: "Silenciar microfone",
};
export const SPACE_CANVAS_SELECTOR = "canvas";
