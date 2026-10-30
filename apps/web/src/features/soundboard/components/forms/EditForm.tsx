import { FormDialogControls } from "@/components/FormDialogControls";
import { useEditClipForm } from "../../hooks/useEditClipForm";
import type { ClipDialogProps } from "../../types/dialog";
import { ClipFormFields } from "../fields/FormFields";

type Props = {
    clip: ClipDialogProps["clip"];
    onDone: () => void;
};

export const EditClipForm = ({ clip, onDone }: Props) => {
    const edit = useEditClipForm({ clip, onDone });

    return (
        <form onSubmit={edit.submit} className="flex flex-col gap-4">
            <ClipFormFields form={edit.form} disabled={edit.isSubmitting} />
            <FormDialogControls
                onClose={onDone}
                isSubmitting={edit.isSubmitting}
                submitDisabled={!edit.hasChanges}
            />
        </form>
    );
};
