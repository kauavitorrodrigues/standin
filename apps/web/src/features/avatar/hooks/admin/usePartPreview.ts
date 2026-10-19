import { useMemo } from "react";
import type { AvatarPartRow } from "@standin/contracts";
import { useAvatarBases } from "../../queries/admin/useAvatarBases";
import { useSheetPixels } from "../../queries/useSheetPixels";
import { buildPreviewLayers } from "../../utils/admin/buildPreviewLayers";
import { pickPreviewBase } from "../../utils/admin/pickPreviewBase";

type Params = { row: AvatarPartRow };

// The part on the figure of the preview (the mannequin in use, or the default
// body without one): downloads its sheet and the base and stacks them. The
// layers go to `AvatarPreviewCanvas`, which assembles and turns them. The
// urls are already resolved by the queries.
export const usePartPreview = ({ row }: Params) => {
    const { groups } = useAvatarBases();
    const baseUrl = pickPreviewBase(groups)?.url ?? null;

    const urls = useMemo(() => {
        const list = [row.url];
        if (baseUrl !== null) list.push(baseUrl);
        return list;
    }, [row.url, baseUrl]);
    const { pixels, isLoading, hasError } = useSheetPixels(urls);

    const front = pixels.get(row.url);
    const base = baseUrl === null ? null : (pixels.get(baseUrl) ?? null);

    const layers = useMemo(() => {
        if (!front) return null;
        return buildPreviewLayers({ slot: row.slot, base, front });
    }, [front, base, row.slot]);

    return { layers, isLoading, isError: hasError };
};
