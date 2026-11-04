import type { AnnounceStartLabelKey } from "../types/announcing";

export const ANNOUNCE_BUTTON_TEXTS = {
    stop: "Parar de anunciar",
    // What the start button says: what it does, or why it cannot right now.
    start: {
        ready: "Anunciar para quem está por perto",
        "mic-muted": "Ative o microfone para anunciar",
    } satisfies Record<AnnounceStartLabelKey, string>,
} as const;
