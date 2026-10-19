import { SelectFormField } from "@/components/fields/SelectFormField";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormFooter } from "@/features/assets/components/views/form/FormFooter";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useNewPartForm } from "../../../hooks/admin/useNewPartForm";
import { getSlotOptions } from "../../../utils/admin/getSlotOptions";
import { PartSheetsFields } from "../../fields/admin/PartSheetsFields";
import { PartMannequinPreview } from "../../instances/admin/PartMannequinPreview";
import { CreatePartLayout } from "../../layout/admin/CreatePartLayout";

// A new part: the slot, the sheets, the color and the name. The color and the
// name come from the front sheet, and the preview shows the part on the blank
// avatar as the sheets are chosen.
export const NewPartForm = () => {
    const { form, mannequin, isSubmitting, issuesMessage, submit, goBack } =
        useNewPartForm();

    return (
        <CreatePartLayout
            form={
                <form onSubmit={submit} className="flex flex-col gap-5">
                    <FormIssues message={issuesMessage} />
                    <div className="flex gap-4">
                        <SelectFormField
                            control={form.control}
                            name="slot"
                            label="Categoria"
                            options={getSlotOptions()}
                            disabled={isSubmitting}
                            className="w-fit min-w-40 shrink-0"
                        />
                        <TextFormField
                            control={form.control}
                            name="name"
                            label="Nome"
                            required
                            disabled={isSubmitting}
                            className="flex-1"
                        />
                    </div>
                    <PartSheetsFields
                        control={form.control}
                        idPrefix="new-part"
                        requireColor={false}
                        disabled={isSubmitting}
                    />
                    <FormFooter
                        submitLabel="Criar peça"
                        isSubmitting={isSubmitting}
                        canSubmit={!mannequin.isLoading}
                        onCancel={goBack}
                    />
                </form>
            }
            preview={<PartMannequinPreview mannequin={mannequin} />}
        />
    );
};
