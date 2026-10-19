import { useFormContext } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomAvatarConfig } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { getRootErrorMessage } from "@/features/assets/utils/getRootErrorMessage";
import { AVATAR_EDITOR_MESSAGES } from "../consts/editor/messages";
import {
    categoryPartsInfiniteOptions,
    resolvePages,
} from "../queries/useCategoryParts";
import type { AvatarEditorFormValues } from "../types/draft";
import type { AvatarEditorCategory } from "../types/editor";
import { buildRandomCatalog, buildRandomParts } from "../utils/randomDraft";
import type { RandomPool } from "../utils/randomDraft";

const FIRST_PAGE_ONLY = 1;

// Fills the draft with a random avatar. It does not save. The editor does not
// hold the whole catalog, so it reads the first page of every category, which
// goes to the same cache the list uses, and picks from there.
export const useRandomizeDraft = (
    categories: readonly AvatarEditorCategory[]
) => {
    const queryClient = useQueryClient();
    const { getValues, setValue } = useFormContext<AvatarEditorFormValues>();

    const { mutate, isPending } = useMutation({
        mutationFn: async (): Promise<RandomPool[]> => {
            const pages = await Promise.all(
                categories.map((category) =>
                    queryClient.ensureInfiniteQueryData({
                        ...categoryPartsInfiniteOptions(category.slot),
                        pages: FIRST_PAGE_ONLY,
                    })
                )
            );
            return categories.map((category, index) => ({
                slot: category.slot,
                items: resolvePages(pages[index]).pages.flatMap(
                    (page) => page.items
                ),
            }));
        },
        onSuccess: (pools) => {
            const config = randomAvatarConfig(
                buildRandomCatalog(pools, getValues("baseId")),
                Math.random
            );
            setValue("parts", buildRandomParts(config.parts, pools), {
                shouldDirty: true,
            });
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

    return { randomize: () => mutate(), isRandomizing: isPending };
};
