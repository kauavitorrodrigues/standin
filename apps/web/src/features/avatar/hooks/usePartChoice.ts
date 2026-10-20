import { useFormContext } from "react-hook-form";
import { AVATAR_SLOTS } from "@standin/contracts";
import type { AvatarSlot } from "@standin/contracts";
import type { AvatarEditorFormValues } from "../types/draft";
import type {
    AvatarCategoryPartItem,
    AvatarCategoryPartVariation,
} from "../types/editor";
import { pickVariation, toDraftChoice } from "../utils/draft";

// A costume covers the whole body, so dressing any other slot takes it off.
const useDropCostume = (slot: AvatarSlot) => {
    const { getValues, setValue } = useFormContext<AvatarEditorFormValues>();

    return () => {
        if (slot === AVATAR_SLOTS.COSTUME) return;
        if (!getValues(`parts.${AVATAR_SLOTS.COSTUME}`)) return;
        setValue(`parts.${AVATAR_SLOTS.COSTUME}`, null, { shouldDirty: true });
    };
};

// What the person can do in a slot: pick a part, pick one of its colors, or
// remove it.
export const usePartChoice = (slot: AvatarSlot) => {
    const { getValues, setValue } = useFormContext<AvatarEditorFormValues>();
    const dropCostume = useDropCostume(slot);

    const choosePart = (item: AvatarCategoryPartItem) => {
        const remembered = getValues(`parts.${slot}`)?.colorKey ?? null;
        const variation = pickVariation(item, remembered);
        if (!variation) return;
        dropCostume();
        setValue(`parts.${slot}`, toDraftChoice(item, variation), {
            shouldDirty: true,
        });
    };

    const chooseVariation = (
        item: AvatarCategoryPartItem,
        variation: AvatarCategoryPartVariation
    ) => {
        dropCostume();
        setValue(`parts.${slot}`, toDraftChoice(item, variation), {
            shouldDirty: true,
        });
    };

    const removePart = () => {
        setValue(`parts.${slot}`, null, { shouldDirty: true });
    };

    return { choosePart, chooseVariation, removePart };
};
