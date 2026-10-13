import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
    ASSET_ACTIONS,
    getFamilyBase,
    type LibraryFamilyDetail,
} from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { NO_ROTATION } from "../consts/rotationMeta";
import { ASSET_MESSAGES } from "../consts/messages";
import { STATIC_FRAME_COUNT } from "../consts/frames";
import { useCreateVariant } from "../mutations/createVariant";
import type { AddVariantFormValues } from "../types/addVariantForm";
import { applyApiErrorWithFallback } from "../utils/applyApiErrorWithFallback";
import { buildVariantData } from "../utils/buildVariantData";
import { getVariantKind, VARIANT_KINDS } from "../utils/getVariantKind";
import { validateAddVariant } from "../utils/validateAddVariant";
import { validateUploadFile } from "../utils/validateUploadFile";
import { useVariantAutoColor } from "./useVariantAutoColor";

type Params = {
    family: LibraryFamilyDetail;
    onDone: () => void;
};

// Everything the form of a new variation does: what the family needs from
// it (a color, a footprint, seats), the checks that save a round trip, and
// sending it.
export const useAddVariantForm = ({ family, onDone }: Params) => {
    const createVariant = useCreateVariant();
    const base = getFamilyBase(family.variants);
    const familyHasColor = family.colors.length > 0;

    const form = useForm<AddVariantFormValues>({
        defaultValues: {
            image: [],
            colorKey: "",
            colorHex: "",
            rotation: base.rotation ?? NO_ROTATION,
            footprintW: base.footprint.h,
            footprintH: base.footprint.w,
            footprintOffsetX: 0,
            seats: [],
            targetX: undefined,
            targetY: undefined,
        },
    });
    const [images, rotation] = useWatch({
        control: form.control,
        name: ["image", "rotation"],
    });
    const [file] = images;
    const isNewRotation =
        getVariantKind(family, rotation) === VARIANT_KINDS.ROTATION;
    const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
    useVariantAutoColor(form, familyHasColor);

    const onSubmit = async (values: AddVariantFormValues) => {
        const errors = validateAddVariant(family, values);
        const [image] = values.image;
        if (image) {
            const message = await validateUploadFile(image);
            if (message) errors.image = message;
        }
        const fields = Object.keys(errors) as (keyof AddVariantFormValues)[];
        if (fields.length > 0 || !image) {
            for (const field of fields) {
                form.setError(field, { message: errors[field] });
            }
            return;
        }

        try {
            await createVariant.mutateAsync({
                baseId: base.id,
                image,
                data: buildVariantData(family, values),
            });
            toast.add({
                title: ASSET_MESSAGES.VARIANT_CREATED,
                type: "success",
            });
            onDone();
        } catch (error) {
            applyApiErrorWithFallback(
                error,
                form.setError,
                ASSET_MESSAGES.VARIANT_CREATE_FAILED
            );
        }
    };

    return {
        form,
        base,
        file,
        familyHasColor,
        isNewRotation,
        // A chair also has its seats to mark.
        hasSeats: base.action === ASSET_ACTIONS.SIT,
        // The editor needs the image, and only a new rotation has a footprint.
        showEditor: file !== undefined && isNewRotation,
        frameCount: base.animation?.frameCount ?? STATIC_FRAME_COUNT,
        selectedSeat,
        setSelectedSeat,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
    };
};
