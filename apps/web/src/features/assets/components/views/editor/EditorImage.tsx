import type { Zoom } from "../../../consts/editorZoom";
import type { ImageSize } from "../../../queries/useImageSize";

type Props = {
    url: string | undefined;
    size: ImageSize | undefined;
    zoom: Zoom;
};

// The picture the editor marks, drawn pixel by pixel. It is left out until
// the browser has a URL for the file.
export const EditorImage = ({ url, size, zoom }: Props) => {
    if (!url) return null;

    return (
        <img
            src={url}
            alt="Imagem enviada"
            draggable={false}
            className="absolute inset-0 max-w-none"
            style={{
                width: (size?.w ?? 0) * zoom,
                height: (size?.h ?? 0) * zoom,
                imageRendering: "pixelated",
            }}
        />
    );
};
