import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SizeTier } from "@standin/contracts";
import { captureMapPreview } from "@/features/game/preview/captureMapPreview";
import { toPreviewMapData } from "@/features/game/preview/toPreviewMapData";
import { saveMapThumbnail } from "@/features/maps/__shared__/utils/saveMapThumbnail";
import { blankPreviewQueryOptions } from "@/features/maps/templates/queries/useBlankPreview";
import { templatePreviewQueryOptions } from "@/features/maps/templates/queries/usePreview";
import { SpaceMutations } from "../mutations";

type Source = {
    spaceId: string;
    // The map the space was made from: the template, or a blank one of `tier`.
    templateId: string | undefined;
    tier: SizeTier;
};

/**
 * Gives a space that was just created its photo, drawn from the map it started
 * from, so the card is born with an image. The preview is the one the creation
 * page already showed, so it comes from the cache. It never throws: a space
 * without a photo is whole, and the editor makes the photo the first time it
 * opens.
 */
export const useCaptureSpaceThumbnail = () => {
    const queryClient = useQueryClient();
    const { mutateAsync: setThumbnail } = SpaceMutations.setThumbnail();

    return useCallback(
        ({ spaceId, templateId, tier }: Source): Promise<void> =>
            saveMapThumbnail(
                async () => {
                    const options = templateId
                        ? templatePreviewQueryOptions(templateId)
                        : blankPreviewQueryOptions(tier);
                    const preview = await queryClient.ensureQueryData(options);
                    return captureMapPreview(toPreviewMapData(preview));
                },
                (thumbnail) => setThumbnail({ spaceId, thumbnail })
            ),
        [queryClient, setThumbnail]
    );
};
