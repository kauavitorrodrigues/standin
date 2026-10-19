import type { AvatarPart } from "@standin/contracts";
import { FormFooter } from "@/features/assets/components/views/form/FormFooter";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useNewColorForm } from "../../../hooks/admin/useNewColorForm";
import { PartSheetsFields } from "../../fields/admin/PartSheetsFields";
import { PartMannequinPreview } from "../../instances/admin/PartMannequinPreview";
import { CreatePartLayout } from "../../layout/admin/CreatePartLayout";
import { FamilyColorsRow } from "../../views/admin/FamilyColorsRow";
import { PartIdentityRow } from "../../views/admin/PartIdentityRow";

type Props = { family: AvatarPart };

// A new color of a part. The slot and the name are the ones of the part, and
// the preview shows only the new color on the blank avatar.
export const NewColorForm = ({ family }: Props) => {
    const { form, mannequin, isSubmitting, issuesMessage, submit, goBack } =
        useNewColorForm({ base: family });

    return (
        <CreatePartLayout
            form={
                <form onSubmit={submit} className="flex flex-col gap-5">
                    <FormIssues message={issuesMessage} />
                    <PartIdentityRow part={family} />
                    <FamilyColorsRow colors={family.variations} />
                    <PartSheetsFields
                        control={form.control}
                        idPrefix="new-color"
                        requireColor
                        hideDropzoneWhenFilled
                        disabled={isSubmitting}
                    />
                    <FormFooter
                        submitLabel="Criar cor"
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
