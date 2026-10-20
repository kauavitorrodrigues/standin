import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import type { AvatarBaseKind, AvatarLayer } from "@standin/contracts";
import { AVATAR_ADMIN_PATHS } from "../../consts/avatarNew";
import {
    AVATAR_BASE_MESSAGES,
    AVATAR_PART_VALIDATION_MESSAGES as Validation,
} from "../../consts/messages";
import { CREATE_BASE_DEFAULTS } from "../../consts/partForms";
import { useCreateAvatarBase } from "../../mutations/admin/bases/create";
import { useAvatarBases } from "../../queries/admin/useAvatarBases";
import type { CreateBaseFormValues } from "../../types/parts";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";
import { validatePreviewFile } from "../../utils/admin/validatePreviewFile";
import { validateSheetFile } from "../../utils/admin/validateSheetFile";
import { useSheetFile } from "./useSheetFile";

type Params = {
    // What is being registered. It comes from the URL of the page, so it is
    // never a field the person can fill wrong.
    kind: AvatarBaseKind;
};

// Everything the page of a new base or mannequin does: the live preview of
// the sprite, the checks of the sprite and of the optional image, and the
// request that registers it.
export const useNewBaseForm = ({ kind }: Params) => {
    const navigate = useNavigate();
    const createBase = useCreateAvatarBase();
    const { groups, isLoading: isExistingBasesLoading } = useAvatarBases();
    // The first base of a kind becomes the default by itself (the server
    // enforces this), so the switch only makes sense from the second on.
    const isFirstOfKind =
        !isExistingBasesLoading &&
        (groups.find((group) => group.kind === kind)?.bases.length ?? 0) ===
            0;
    const form = useForm<CreateBaseFormValues>({
        defaultValues: CREATE_BASE_DEFAULTS,
    });
    const [images] = useWatch({
        control: form.control,
        name: ["image"],
    });
    const sheet = useSheetFile(images[0] ?? null);
    const layers = useMemo<AvatarLayer[]>(
        () => (sheet.pixels ? [{ rgba: sheet.pixels }] : []),
        [sheet.pixels]
    );

    const goBack = () => navigate({ to: AVATAR_ADMIN_PATHS.BASES });

    const onSubmit = async (values: CreateBaseFormValues) => {
        const baseName = values.name.trim();
        const [image] = values.image;
        const [preview] = values.preview;

        let hasIssue = false;
        if (baseName === "") {
            form.setError("name", { message: Validation.BASE_NAME_REQUIRED });
            hasIssue = true;
        }
        if (!image) {
            form.setError("image", { message: Validation.SHEET_REQUIRED });
            hasIssue = true;
        }
        if (image) {
            const message = await validateSheetFile(image);
            if (message) form.setError("image", { message });
            hasIssue = hasIssue || message !== null;
        }
        if (preview) {
            const message = await validatePreviewFile(preview);
            if (message) form.setError("preview", { message });
            hasIssue = hasIssue || message !== null;
        }
        if (hasIssue || !image) return;

        try {
            await createBase.mutateAsync({
                image,
                preview: preview ?? null,
                data: {
                    name: baseName,
                    kind,
                    isDefault: values.isDefault,
                },
            });
            await goBack();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(
                    error,
                    AVATAR_BASE_MESSAGES.CREATE_FAILED
                ),
            });
        }
    };

    return {
        form,
        layers,
        sheetIssue: sheet.issue,
        isSheetLoading: sheet.isLoading,
        isFirstOfKind,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
        goBack,
    };
};
