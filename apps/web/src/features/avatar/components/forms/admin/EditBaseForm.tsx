import type { AvatarBase } from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useEditBaseForm } from "../../../hooks/admin/useEditBaseForm";

type Props = { base: AvatarBase; onDone: () => void };

export const EditBaseForm = ({ base, onDone }: Props) => {
    const { form, isSubmitting, issuesMessage, submit } = useEditBaseForm({
        base,
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
            <FormDialogControls isSubmitting={isSubmitting} />
        </form>
    );
};
