import type { ComponentType } from "react";
import type { ClipEditorState } from "../hooks/useClipEditor";

export type ClipEditorStatus = "idle" | "decoding" | "ready" | "error";

// What each step of the editor gets: the editor, how to give it a file and
// whether the form is busy sending.
export type EditorBodyProps = {
    editor: ClipEditorState;
    onPick: (file: File) => void;
    disabled: boolean;
};

export type EditorStepMap = Readonly<
    Record<ClipEditorStatus, ComponentType<EditorBodyProps>>
>;
