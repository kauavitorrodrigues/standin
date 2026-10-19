import type { AvatarCategory } from "@standin/contracts";
import { NumberFormField } from "@/components/fields/NumberFormField";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useEditCategoryForm } from "../../../hooks/admin/useEditCategoryForm";

type Props = { category: AvatarCategory; onDone: () => void };

export const EditCategoryForm = ({ category, onDone }: Props) => {
    const { form, isSubmitting, issuesMessage, submit } = useEditCategoryForm({
        category,
        onDone,
    });

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <FormIssues message={issuesMessage} />
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                required
                disabled={isSubmitting}
            />
            <NumberFormField
                control={form.control}
                name="sortOrder"
                label="Posição na lista"
                hint="A categoria com o menor número aparece primeiro no editor de avatar."
                min={0}
                disabled={isSubmitting}
            />
            <FormDialogControls isSubmitting={isSubmitting} />
        </form>
    );
};
