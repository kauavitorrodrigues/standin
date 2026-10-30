import type { SoundboardClipScope } from "@standin/contracts";
import { FormDialogControls } from "@/components/FormDialogControls";
import { UPLOAD_SUBMIT_LABELS } from "../../consts/upload";
import { useClipEditor } from "../../hooks/useClipEditor";
import { useUploadClipForm } from "../../hooks/useUploadClipForm";
import { UploadFields } from "../fields/UploadFields";
import { ClipEditor } from "../instances/ClipEditor";
import { BlockReason } from "../views/editor/BlockReason";
import { UploadProgress } from "../views/editor/UploadProgress";

type Props = {
    scope: SoundboardClipScope;
    onDone: () => void;
};

// The upload: the editor cuts the file, the form names it, and the submit
// encodes the selection and sends it.
export const UploadClipForm = ({ scope, onDone }: Props) => {
    const editor = useClipEditor();
    const upload = useUploadClipForm({ scope, editor, onDone });

    return (
        <form onSubmit={upload.submit} className="flex flex-col gap-3">
            <ClipEditor
                editor={editor}
                onPick={upload.pickFile}
                disabled={upload.isSubmitting}
            />
            <UploadFields
                visible={editor.status === "ready"}
                form={upload.form}
                disabled={upload.isSubmitting}
            />
            <UploadProgress value={upload.progress} />
            <BlockReason reason={upload.blockReason} />
            <FormDialogControls
                onClose={onDone}
                isSubmitting={upload.isSubmitting}
                submitDisabled={!upload.canSubmit}
                submitLabel={UPLOAD_SUBMIT_LABELS[upload.phase]}
            />
        </form>
    );
};
