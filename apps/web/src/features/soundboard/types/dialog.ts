import type { SoundboardClip } from "@standin/contracts";
import type { ComponentType } from "react";

export type ClipDialogKind = "edit" | "delete";

export type ClipDialogMap = Readonly<
    Record<ClipDialogKind, ComponentType<ClipDialogProps>>
>;

export type ClipDialogProps = {
    clip: Pick<SoundboardClip, "id" | "name" | "icon" | "volume" | "scope">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};
