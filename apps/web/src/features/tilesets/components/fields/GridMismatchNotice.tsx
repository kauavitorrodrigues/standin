import type { ImageSize } from "@/features/assets/queries/useImageSize";
import type { TileSheetGrid } from "../../types/sheet";

type Props = {
    size: ImageSize | undefined;
    grid: TileSheetGrid | null;
};

// Says what to do when the image does not divide into cells of 32 px with the
// margin and the spacing typed.
export const GridMismatchNotice = ({ size, grid }: Props) => {
    if (!size || grid) return null;

    return (
        <p className="text-destructive text-sm">
            A imagem não divide em células de 32 px com essa margem e esse
            espaçamento. Ajuste os dois, ou use outra imagem.
        </p>
    );
};
