import type { EditorModel } from "@standin/contracts";
import { TILE_HINTS } from "@/features/editor/consts/messages";
import type { BrushTarget } from "@/features/editor/types/brush-target";
import type { EditorBrush } from "@/features/editor/types/editor-brush";
import { getBrushLayer } from "@/features/editor/utils/getBrushLayer";

type ResolveInput = {
    brush: EditorBrush | null;
    model: Pick<EditorModel, "library">;
    setHint: (text: string | null) => void;
};

// The tile and layer a painting gesture starts with. With no tile picked, or a
// tile no layer takes, the hint says so and the gesture does not start.
export const resolveBrushTarget = ({
    brush,
    model,
    setHint,
}: ResolveInput): BrushTarget | null => {
    if (!brush) {
        setHint(TILE_HINTS.NO_BRUSH);
        return null;
    }

    const layer = getBrushLayer(model, brush);
    if (!layer) {
        setHint(TILE_HINTS.NO_LAYER);
        return null;
    }

    setHint(null);
    return { brush, layer };
};
