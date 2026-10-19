import type { AvatarBase } from "@standin/contracts";
import { FormDialogControls } from "@/components/FormDialogControls";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useReplaceBaseSheetForm } from "../../../hooks/admin/useReplaceBaseSheetForm";
import { SheetFormField } from "../../fields/admin/SheetFormField";

type Props = { base: AvatarBase; onDone: () => void };

export const ReplaceBaseSheetForm = ({ base, onDone }: Props) => {
    const { form, isSubmitting, issuesMessage, submit } =
        useReplaceBaseSheetForm({ base, onDone });

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <FormIssues message={issuesMessage} />
            <SheetFormField
                control={form.control}
                name="image"
                id="replace-base-sheet"
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
