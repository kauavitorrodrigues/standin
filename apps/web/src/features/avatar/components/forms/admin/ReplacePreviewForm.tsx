import { FormDialogControls } from "@/components/FormDialogControls";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useReplacePreviewForm } from "../../../hooks/admin/useReplacePreviewForm";
import { PreviewFileField } from "../../fields/admin/PreviewFileField";

type Props = {
    replace: (image: File) => Promise<unknown>;
    failedMessage: string;
    onDone: () => void;
};

// Sends one preview image. The same form serves the parts, the categories
// and the bases, each with its own route.
export const ReplacePreviewForm = ({
    replace,
    failedMessage,
    onDone,
}: Props) => {
    const { form, isSubmitting, issuesMessage, submit } = useReplacePreviewForm(
        { replace, failedMessage, onDone }
    );

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <FormIssues message={issuesMessage} />
            <PreviewFileField
                control={form.control}
                name="image"
                id="replace-preview-image"
                label="Imagem"
                required
                largePreview
                disabled={isSubmitting}
            />
            <FormDialogControls
                submitLabel="Salvar imagem"
                isSubmitting={isSubmitting}
            />
        </form>
    );
};
