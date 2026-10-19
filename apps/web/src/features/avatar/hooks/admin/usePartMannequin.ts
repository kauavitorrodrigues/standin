import { useMemo } from "react";
import { assembleSheet } from "@standin/contracts";
import type { AvatarSlot } from "@standin/contracts";
import { useAvatarBases } from "../../queries/admin/useAvatarBases";
import { useSheetPixels } from "../../queries/useSheetPixels";
import { buildBlankLayers } from "../../utils/admin/buildBlankLayers";
import { buildPreviewLayers } from "../../utils/admin/buildPreviewLayers";
import { pickPreviewBase } from "../../utils/admin/pickPreviewBase";
import { useSheetFile } from "./useSheetFile";

type Params = {
    slot: AvatarSlot;
    // The sheet the person chose in the form, null while there is none.
    front: File | null;
};

// The live preview of a part that is being created: the figure to dress with
// the chosen sheet on it and nothing else. The figure is the mannequin in
// use, or the default body while no mannequin is registered
// (`previewBaseKind` says which one, null when there is none). `composed` is
// the assembled sheet, used for conference only.
export const usePartMannequin = ({ slot, front }: Params) => {
    const { groups, isPending: isBasesPending } = useAvatarBases();
    const base = pickPreviewBase(groups);

    const baseUrls = useMemo(() => (base ? [base.url] : []), [base]);
    const { pixels: basePixels } = useSheetPixels(baseUrls);

    const frontSheet = useSheetFile(front);
    const frontPixels = frontSheet.pixels;
    const basePart = base ? (basePixels.get(base.url) ?? null) : null;

    const layers = useMemo(() => {
        // Without a front sheet the stage still shows the blank avatar alone.
        if (!frontPixels) return buildBlankLayers(slot, basePart);
        return buildPreviewLayers({
            slot,
            base: basePart,
            front: frontPixels,
        });
    }, [slot, basePart, frontPixels]);

    // Only a chosen sheet makes a composed image worth showing.
    const composed = useMemo(
        () => (frontPixels ? assembleSheet(layers) : null),
        [frontPixels, layers]
    );

    return {
        isBasesPending,
        previewBaseKind: base?.kind ?? null,
        layers,
        composed,
        frontPixels,
        frontIssue: frontSheet.issue,
        isLoading: frontSheet.isLoading,
    };
};

export type PartMannequin = ReturnType<typeof usePartMannequin>;
