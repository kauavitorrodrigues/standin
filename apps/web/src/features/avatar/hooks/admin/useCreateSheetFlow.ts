import { useEffect } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { AvatarSlot } from "@standin/contracts";
import { AVATAR_PART_VALIDATION_MESSAGES as Validation } from "../../consts/messages";
import type { CreateSheetFormValues } from "../../types/partCreate";
import { usePartMannequin } from "./usePartMannequin";
import { useSheetAutoColor } from "./useSheetAutoColor";

const SHEET_ISSUE_TYPE = "sheet";

type Params<T extends CreateSheetFormValues> = {
    form: UseFormReturn<T>;
    slot: AvatarSlot;
};

// Shows the problem of the chosen sheet on its field, and takes it away when
// the sheet changes. Only the error this hook put there is cleared.
const syncSheetIssue = (
    form: UseFormReturn<CreateSheetFormValues>,
    issue: string | null
) => {
    if (issue !== null) {
        form.setError("image", { type: SHEET_ISSUE_TYPE, message: issue });
        return;
    }
    if (form.getFieldState("image").error?.type === SHEET_ISSUE_TYPE) {
        form.clearErrors("image");
    }
};

// What the pages that create a part or a color have in common: the live
// preview of the chosen sheet (for conference only), the color filled from it
// and the problem of the file on its field.
export const useCreateSheetFlow = <T extends CreateSheetFormValues>({
    form,
    slot,
}: Params<T>) => {
    // The form of a page has more fields than these, which are the only ones
    // this hook reads and writes.
    const sheetForm = form as unknown as UseFormReturn<CreateSheetFormValues>;
    const [images] = useWatch({
        control: sheetForm.control,
        name: ["image"],
    });
    const mannequin = usePartMannequin({
        slot,
        front: images[0] ?? null,
    });
    const { dirtyFields } = sheetForm.formState;

    useSheetAutoColor({
        pixels: mannequin.frontPixels,
        isHexEdited: Boolean(dirtyFields.colorHex),
        isKeyEdited: Boolean(dirtyFields.colorKey),
        onColor: (color) => {
            if (color.colorHex) sheetForm.setValue("colorHex", color.colorHex);
            if (color.colorKey) sheetForm.setValue("colorKey", color.colorKey);
        },
    });

    const { frontIssue } = mannequin;
    useEffect(() => {
        syncSheetIssue(sheetForm, frontIssue);
    }, [sheetForm, frontIssue]);

    // True when the sheet stops the submit, with the reason on the field.
    const hasSheetIssue = (image: File | undefined) => {
        if (!image) {
            sheetForm.setError("image", {
                message: Validation.FRONT_REQUIRED,
            });
            return true;
        }
        return mannequin.isLoading || frontIssue !== null;
    };

    return { mannequin, hasSheetIssue };
};
