import { InfoIcon } from "lucide-react";
import { EDITOR_MODES, type EditorMode } from "../../../consts/editorModes";

type Props = {
    mode: EditorMode;
    hasCrop: boolean;
    // The crop is a strip of frames, and the footprint fits in one of them.
    isStrip: boolean;
};

// What the next drag over the image will do.
export const EditorHint = ({ mode, hasCrop, isStrip }: Props) => (
    <p className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm">
        <InfoIcon className="size-3.5 shrink-0 text-primary" />
        <EditorHintText mode={mode} hasCrop={hasCrop} isStrip={isStrip} />
    </p>
);

const EditorHintText = ({ mode, hasCrop, isStrip }: Props) => {
    if (mode !== EDITOR_MODES.FOOTPRINT || !hasCrop) {
        return <>Arraste sobre a imagem para marcar a peça.</>;
    }
    if (isStrip) {
        return (
            <>
                Arraste dentro do primeiro frame para marcar a pegada. Ela não
                passa da largura de um frame e sempre vai até a base.
            </>
        );
    }
    return (
        <>
            Arraste dentro do recorte para marcar a pegada. Ela sempre vai até a
            base.
        </>
    );
};
