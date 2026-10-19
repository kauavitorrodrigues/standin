import type { AvatarPartRow } from "@standin/contracts";
import { FormDialogControls } from "@/components/FormDialogControls";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useReplaceSheetForm } from "../../../hooks/admin/useReplaceSheetForm";
import { SheetFormField } from "../../fields/admin/SheetFormField";

type Props = { part: AvatarPartRow; onDone: () => void };

// Swaps the sprite of a part. The avatars that use the part are rebuilt by
// the server once the file is saved.
export const ReplaceSheetForm = ({ part, onDone }: Props) => {
    const { form, isSubmitting, issuesMessage, submit } = useReplaceSheetForm({
        part,
        onDone,
    });

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <FormIssues message={issuesMessage} />
            <SheetFormField
                control={form.control}
                name="image"
                id="replace-part-sheet"
                label="Novo PNG"
                hint="Precisa ter o tamanho exato da grade do avatar, com fundo transparente."
                required
                disabled={isSubmitting}
            />
            <FormDialogControls
                submitLabel="Salvar imagem"
                isSubmitting={isSubmitting}
            />
        </form>
    );
};
