import type { AvatarPartRow } from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useEditPartForm } from "../../../hooks/admin/useEditPartForm";
import { ColorPairFields } from "../../fields/admin/ColorPairFields";

type Props = { part: AvatarPartRow; onDone: () => void };

export const EditPartForm = ({ part, onDone }: Props) => {
    const { form, isSubmitting, issuesMessage, submit } = useEditPartForm({
        row: part,
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
            <ColorPairFields
                control={form.control}
                required={part.colorKey !== null}
                disabled={isSubmitting}
            />
            <FormDialogControls isSubmitting={isSubmitting} />
        </form>
    );
};
