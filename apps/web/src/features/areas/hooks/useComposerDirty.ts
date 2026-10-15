import { useFormState, type Control } from "react-hook-form";
import { useFrameRect } from "@/features/editor/hooks/useFrameRect";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import type { FrameStore } from "@/features/editor/lib/FrameStore";
import type { TileRect } from "@/features/editor/types/tile-rect";
import { isSameTileRect } from "@/features/editor/utils/isSameTileRect";
import type { AreaComposerFormValues } from "../types/areaComposerForm";

type Params = {
    control: Control<AreaComposerFormValues>;
    frameStore: FrameStore;
    initialFrame: TileRect;
};

// Whether there is something not saved: an edit of the canvas, a frame that
// is not where it opened, or a field that was changed.
export const useComposerDirty = ({
    control,
    frameStore,
    initialFrame,
}: Params): boolean => {
    const hasEdits = useEditorSelector((state) => state.draft.hasChanges);
    const frame = useFrameRect(frameStore);
    const { isDirty } = useFormState({ control });

    return hasEdits || !isSameTileRect(frame, initialFrame) || isDirty;
};
