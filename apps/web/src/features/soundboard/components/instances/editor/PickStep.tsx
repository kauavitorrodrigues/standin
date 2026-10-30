import type { EditorBodyProps } from "../../../types/editor";
import { PickClipFile } from "../../views/editor/PickFile";
import { PickError } from "../../views/editor/PickError";

// Before a file is open, and after one that could not be read.
export const EditorPickStep = ({
    editor,
    onPick,
    disabled,
}: EditorBodyProps) => (
    <div className="flex flex-col gap-2">
        <PickError message={editor.errorMessage} />
        <PickClipFile onPick={onPick} disabled={disabled} />
    </div>
);
