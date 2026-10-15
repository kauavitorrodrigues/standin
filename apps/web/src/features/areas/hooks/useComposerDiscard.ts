import type { UseFormReturn } from "react-hook-form";
import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { FrameStore } from "@/features/editor/lib/FrameStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { TileRect } from "@/features/editor/types/tile-rect";
import type { AreaComposerFormValues } from "../types/areaComposerForm";

type Params = {
    form: UseFormReturn<AreaComposerFormValues>;
    draftStore: DraftStore;
    frameStore: FrameStore;
    initialFrame: TileRect;
};

// Back to how the composer opened: the canvas, the frame and the fields.
export const useComposerDiscard = ({
    form,
    draftStore,
    frameStore,
    initialFrame,
}: Params) => {
    const store = useEditorStore();

    return () => {
        store.clearSelectionAndPlacing();
        draftStore.discard();
        frameStore.setRect(initialFrame);
        form.reset();
    };
};
