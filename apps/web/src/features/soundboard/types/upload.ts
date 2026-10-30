import type { SoundboardClipScope } from "@standin/contracts";
import type { ClipDraft } from "./clip";

export type ClipUploadFields = ClipDraft;

export type UploadClipInput = ClipUploadFields & {
    scope: SoundboardClipScope;
    bytes: Uint8Array<ArrayBuffer>;
    onProgress?: (percent: number) => void;
};

export type UploadPhase = "idle" | "encoding" | "sending";

export type UploadPhaseLabels = Readonly<Record<UploadPhase, string>>;

// The part of a drag event the drop area reads, so the handlers do not depend
// on the whole DOM event.
export type DropEventLike = {
    preventDefault: () => void;
    dataTransfer: { files: ArrayLike<File> };
};
