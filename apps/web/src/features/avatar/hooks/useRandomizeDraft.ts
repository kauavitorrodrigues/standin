import { useFormContext } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomAvatarConfig } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { getRootErrorMessage } from "@/features/assets/utils/getRootErrorMessage";
import { AVATAR_EDITOR_MESSAGES } from "../consts/editor/messages";
import { loadAllCategoryParts } from "../queries/loadAllCategoryParts";
import type { AvatarEditorFormValues, RandomizeOptions } from "../types/draft";
import type { AvatarEditorCategory } from "../types/editor";
import { buildConfig } from "../utils/draft";
import { buildRandomCatalog, buildRandomParts } from "../utils/randomDraft";
import type { RandomPool } from "../utils/randomDraft";

// Fills the draft with a random avatar. It does not save. The editor does not
// hold the whole catalog, so it reads every page of every category, which goes
// to the same cache the list uses, and picks from there. Essential slots are
// drawn again, the others keep the draft unless they win a small chance, and
// the costume is cleared.
export const useRandomizeDraft = (
    categories: readonly AvatarEditorCategory[]
) => {
    const queryClient = useQueryClient();
    const { getValues, setValue } = useFormContext<AvatarEditorFormValues>();

    const draftKey = () => JSON.stringify(buildConfig(getValues()));

    const { mutate, isPending } = useMutation<
        RandomPool[],
        Error,
        RandomizeOptions
    >({
        mutationFn: async () => {
            const items = await Promise.all(
                categories.map((category) =>
                    loadAllCategoryParts(queryClient, category.slot)
                )
            );
            return categories.map((category, index) => ({
                slot: category.slot,
                items: items[index],
            }));
        },
        onSuccess: (pools, { untouchedKey }) => {
            // The start draft gives way to anything chosen while it loaded.
            if (untouchedKey !== null && untouchedKey !== draftKey()) return;
            const draft = getValues();
            const config = randomAvatarConfig(
                buildRandomCatalog(pools, draft.baseId),
                Math.random,
                buildConfig(draft).parts
            );
            setValue(
                "parts",
                buildRandomParts(config.parts, pools, draft.parts),
                {
                    shouldDirty: true,
                }
            );
        },
        onError: (error) => {
            toast.add({
                title: getRootErrorMessage(
                    error,
                    AVATAR_EDITOR_MESSAGES.RANDOMIZE_FAILED
                ),
                type: "error",
            });
        },
    });

    return {
        randomize: () => mutate({ untouchedKey: null }),
        // For the draft a person gets on opening: skipped if they pick first.
        randomizeIfUntouched: () => mutate({ untouchedKey: draftKey() }),
        isRandomizing: isPending,
    };
};
