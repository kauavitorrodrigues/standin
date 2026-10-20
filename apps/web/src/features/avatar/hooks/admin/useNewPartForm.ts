import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { AVATAR_ADMIN_PATHS } from "../../consts/avatarNew";
import {
    AVATAR_PART_MESSAGES,
    AVATAR_PART_VALIDATION_MESSAGES as Validation,
} from "../../consts/messages";
import { CREATE_PART_PAGE_DEFAULTS } from "../../consts/partCreate";
import type { CreatePartPageValues } from "../../types/partCreate";
import { buildNewPartData } from "../../utils/admin/buildNewPartData";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";
import { getColorPairIssues } from "../../utils/admin/getColorPairIssues";
import { setColorPairErrors } from "../../utils/admin/setColorPairErrors";
import { validatePreviewFile } from "../../utils/admin/validatePreviewFile";
import { useCreatePartWithPreview } from "./useCreatePartWithPreview";
import { useCreateSheetFlow } from "./useCreateSheetFlow";
import { useSuggestPartName } from "./useSuggestPartName";

// Everything the page of a new part does: the live preview (for conference
// only), the color and the name taken from the sheet, the checks, and the
// request that creates the part from its sprite and its preview image.
export const useNewPartForm = () => {
    const navigate = useNavigate();
    const { create } = useCreatePartWithPreview();
    const form = useForm<CreatePartPageValues>({
        defaultValues: CREATE_PART_PAGE_DEFAULTS,
    });
    const [slot] = useWatch({
        control: form.control,
        name: ["slot"],
    });
    const { mannequin, hasSheetIssue } = useCreateSheetFlow({ form, slot });
    useSuggestPartName(form);

    const goBack = () => navigate({ to: AVATAR_ADMIN_PATHS.PARTS });

    const onSubmit = async (values: CreatePartPageValues) => {
        const [image] = values.image;
        const [preview] = values.preview;

        let hasIssue = setColorPairErrors(
            form.setError,
            getColorPairIssues(values, false)
        );
        if (values.name.trim() === "") {
            form.setError("name", { message: Validation.NAME_REQUIRED });
            hasIssue = true;
        }
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
                mode: "part",
                image,
                preview,
                data: buildNewPartData(values),
            });
            await goBack();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(
                    error,
                    AVATAR_PART_MESSAGES.CREATE_FAILED
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
