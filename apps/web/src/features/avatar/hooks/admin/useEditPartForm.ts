import { useForm } from "react-hook-form";
import type { AvatarPartRow, UpdateAvatarPartData } from "@standin/contracts";
import {
    AVATAR_PART_MESSAGES,
    AVATAR_PART_VALIDATION_MESSAGES as Validation,
} from "../../consts/messages";
import { useUpdateAvatarPart } from "../../mutations/admin/update";
import type { EditPartFormValues } from "../../types/parts";
import { buildPartChanges } from "../../utils/admin/buildPartChanges";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";
import { getColorPairIssues } from "../../utils/admin/getColorPairIssues";
import { normalizeColorHex } from "../../utils/admin/normalizeColorHex";
import { setColorPairErrors } from "../../utils/admin/setColorPairErrors";

type Params = { row: AvatarPartRow; onDone: () => void };

// Edits the name of a part (shared by the whole family) and the color of one
// row. Only what changed is sent.
export const useEditPartForm = ({ row, onDone }: Params) => {
    const updatePart = useUpdateAvatarPart();
    const initial: EditPartFormValues = {
        name: row.name,
        colorKey: row.colorKey ?? "",
        colorHex: row.colorHex ?? "",
    };
    const form = useForm<EditPartFormValues>({ defaultValues: initial });

    const onSubmit = async (values: EditPartFormValues) => {
        const name = values.name.trim();
        // A row that has a color cannot lose it, so it stays required.
        const issues = getColorPairIssues(values, initial.colorKey !== "");
        let hasIssue = setColorPairErrors(form.setError, issues);
        if (name === "") {
            form.setError("name", { message: Validation.NAME_REQUIRED });
            hasIssue = true;
        }
        if (hasIssue) return;

        const changes: UpdateAvatarPartData = buildPartChanges(initial, {
            name,
            colorKey: values.colorKey.trim(),
            colorHex: normalizeColorHex(values.colorHex),
        });
        if (Object.keys(changes).length === 0) return onDone();

        try {
            await updatePart.mutateAsync({ partId: row.id, changes });
            onDone();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(
                    error,
                    AVATAR_PART_MESSAGES.UPDATE_FAILED
                ),
            });
        }
    };

    return {
        form,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
    };
};
