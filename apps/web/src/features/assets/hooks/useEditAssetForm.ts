import { useForm } from "react-hook-form";
import type { LibraryFamilyVariant } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { ASSET_FORM_MESSAGES } from "../consts/messages";
import { ASSET_VALIDATION_MESSAGES } from "../consts/validationMessages";
import { useUpdateAsset } from "../mutations/update";
import type { EditAssetFormValues } from "../types/editForm";
import { applyApiErrorWithFallback } from "../utils/applyApiErrorWithFallback";
import { buildAssetChanges } from "../utils/buildChanges";
import { getAssetEditState, isEditFieldLocked } from "../utils/getEditState";
import { toEditAssetValues } from "../utils/toEditValues";

type Params = {
    asset: LibraryFamilyVariant;
    onDone: () => void;
};

// Everything the form that edits a base asset does. A row that maps use only
// accepts a few fields, so the others are locked.
export const useEditAssetForm = ({ asset, onDone }: Params) => {
    const updateAsset = useUpdateAsset();
    const initial = toEditAssetValues(asset);
    const editState = getAssetEditState(asset);
    const form = useForm<EditAssetFormValues>({ defaultValues: initial });
    const { isSubmitting } = form.formState;

    // A field that is being sent, or that cannot change, is not editable.
    const isDisabled = (field: keyof EditAssetFormValues) =>
        isSubmitting || isEditFieldLocked(editState, field);

    const onSubmit = async (values: EditAssetFormValues) => {
        if (values.name.trim() === "") {
            form.setError("name", {
                message: ASSET_VALIDATION_MESSAGES.REQUIRED,
            });
            return;
        }
        const changes = buildAssetChanges(initial, values);
        if (Object.keys(changes).length === 0) return onDone();

        try {
            await updateAsset.mutateAsync({ assetId: asset.id, changes });
            toast.add({
                title: ASSET_FORM_MESSAGES.UPDATED,
                type: "success",
            });
            onDone();
        } catch (error) {
            applyApiErrorWithFallback(
                error,
                form.setError,
                ASSET_FORM_MESSAGES.UPDATE_FAILED
            );
        }
    };

    return {
        form,
        isSubmitting,
        isDisabled,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
    };
};
