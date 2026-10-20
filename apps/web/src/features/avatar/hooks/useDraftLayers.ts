import { useMemo, useState } from "react";
import { useSheetPixels } from "../queries/useSheetPixels";
import type { AvatarDraft } from "../types/draft";
import type { AvatarEditorBase } from "../types/editor";
import { buildDraftLayers, collectDraftUrls } from "../utils/draftLayers";

// The layers of the draft in drawing order, with their sheets decoded. It is
// what the preview and the download draw. While a sheet of the draft is still
// arriving, the layers of the last complete draft stay, so the avatar does not
// lose the piece that is being swapped and come back a moment later.
export const useDraftLayers = (
    draft: AvatarDraft,
    bases: readonly AvatarEditorBase[]
) => {
    const urls = useMemo(() => collectDraftUrls(draft, bases), [draft, bases]);
    const { pixels, isLoading, hasError } = useSheetPixels(urls);
    const layers = useMemo(
        () => buildDraftLayers(draft, bases, pixels),
        [draft, bases, pixels]
    );
    const [settled, setSettled] = useState(layers);

    if (!isLoading && settled !== layers) setSettled(layers);

    return { layers: isLoading ? settled : layers, isLoading, hasError };
};
