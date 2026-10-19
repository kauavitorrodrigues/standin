import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import type { AvatarPartRow } from "@standin/contracts";
import { AVATAR_ADMIN_PATHS } from "../../consts/avatarNew";
import {
    AVATAR_PART_MESSAGES,
    AVATAR_PART_VALIDATION_MESSAGES as Validation,
} from "../../consts/messages";
import { CREATE_SHEET_DEFAULTS } from "../../consts/partCreate";
import type { CreateSheetFormValues } from "../../types/partCreate";
import { buildNewColorData } from "../../utils/admin/buildNewPartData";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";
import { getColorPairIssues } from "../../utils/admin/getColorPairIssues";
import { setColorPairErrors } from "../../utils/admin/setColorPairErrors";
import { validatePreviewFile } from "../../utils/admin/validatePreviewFile";
import { useCreatePartWithPreview } from "./useCreatePartWithPreview";
import { useCreateSheetFlow } from "./useCreateSheetFlow";

type Params = {
    // The base part of the family that gets the color.
    base: AvatarPartRow;
};

// Everything the page of a new color does. The slot and the name are the ones
// of the base part, so the form has only the sheet, the preview and the
// color.
export const useNewColorForm = ({ base }: Params) => {
    const navigate = useNavigate();
    const { create } = useCreatePartWithPreview();
    const form = useForm<CreateSheetFormValues>({
        defaultValues: CREATE_SHEET_DEFAULTS,
    });
    const { mannequin, hasSheetIssue } = useCreateSheetFlow({
        form,
        slot: base.slot,
    });

    const goBack = () => navigate({ to: AVATAR_ADMIN_PATHS.PARTS });

    const onSubmit = async (values: CreateSheetFormValues) => {
        const [image] = values.image;
        const [preview] = values.preview;

        let hasIssue = setColorPairErrors(
            form.setError,
            getColorPairIssues(values, true)
        );
        hasIssue = hasSheetIssue(image) || hasIssue;
        if (!preview) {
            form.setError("preview", {
                message: Validation.PREVIEW_REQUIRED,
            });
            hasIssue = true;
        } else {
            const message = await validatePreviewFile(preview);
            if (message) {
                form.setError("preview", { message });
                hasIssue = true;
            }
        }
        if (hasIssue || !image || !preview) return;

        try {
            await create({
                mode: "color",
                baseId: base.id,
                image,
                preview,
                data: buildNewColorData(values),
            });
            await goBack();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(
                    error,
                    AVATAR_PART_MESSAGES.CREATE_VARIATION_FAILED
                ),
            });
        }
    };

    return {
        form,
        mannequin,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
        goBack,
    };
};
