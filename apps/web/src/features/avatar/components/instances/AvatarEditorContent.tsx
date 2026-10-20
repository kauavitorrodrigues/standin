import type { RefObject } from "react";
import { useAvatarEditor } from "../../queries/useAvatarEditor";
import type { MyAvatar } from "../../types/editor";
import { AvatarEditorForm } from "../forms/AvatarEditorForm";
import { AvatarEditorError } from "../views/AvatarEditorError";
import { AvatarEditorSkeleton } from "../views/AvatarEditorSkeleton";

type AvatarEditorContentProps = {
    // Kept up to date with whether the draft has unsaved changes.
    isDirtyRef: RefObject<boolean>;
    onDone: () => void;
    onSaved?: (avatar: MyAvatar) => void;
};

// Loads what the editor needs and picks what to show: the skeleton, the
// error with a retry, or the editor with the avatar the person has now. The
// parts of each category load later, when the category is opened.
export const AvatarEditorContent = ({
    isDirtyRef,
    onDone,
    onSaved,
}: AvatarEditorContentProps) => {
    const editor = useAvatarEditor();

    if (editor.isPending) return <AvatarEditorSkeleton />;
    if (!editor.data) {
        return <AvatarEditorError onRetry={() => void editor.refetch()} />;
    }

    return (
        <AvatarEditorForm
            editor={editor.data}
            isDirtyRef={isDirtyRef}
            onDone={onDone}
            onSaved={onSaved}
        />
    );
};
