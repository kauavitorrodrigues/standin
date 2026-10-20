import { useForm } from "react-hook-form";
import type {
    AvatarCategory,
    UpdateAvatarCategoryData,
} from "@standin/contracts";
import {
    AVATAR_CATEGORY_MESSAGES,
    AVATAR_PART_VALIDATION_MESSAGES as Validation,
} from "../../consts/messages";
import { useUpdateAvatarCategory } from "../../mutations/admin/categories/update";
import type { EditCategoryFormValues } from "../../types/parts";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";
import { isValidSortOrder } from "../../utils/admin/isValidSortOrder";

type Params = { category: AvatarCategory; onDone: () => void };

// Edits the name and the position of a category in the editor list. The slot
// and the image do not change here.
export const useEditCategoryForm = ({ category, onDone }: Params) => {
    const updateCategory = useUpdateAvatarCategory();
    const form = useForm<EditCategoryFormValues>({
        defaultValues: {
            name: category.name,
            sortOrder: category.sortOrder,
        },
    });

    const onSubmit = async (values: EditCategoryFormValues) => {
        const name = values.name.trim();
        let hasIssue = false;
        if (name === "") {
            form.setError("name", {
                message: Validation.CATEGORY_NAME_REQUIRED,
            });
            hasIssue = true;
        }
        if (!isValidSortOrder(values.sortOrder)) {
            form.setError("sortOrder", {
                message: Validation.SORT_ORDER_INVALID,
            });
            hasIssue = true;
        }
        if (hasIssue) return;

        const changes: UpdateAvatarCategoryData = {};
        if (name !== category.name) changes.name = name;
        if (values.sortOrder !== category.sortOrder) {
            changes.sortOrder = values.sortOrder;
        }
        if (Object.keys(changes).length === 0) return onDone();

        try {
            await updateCategory.mutateAsync({ slot: category.slot, changes });
            onDone();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(
                    error,
                    AVATAR_CATEGORY_MESSAGES.UPDATE_FAILED
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
