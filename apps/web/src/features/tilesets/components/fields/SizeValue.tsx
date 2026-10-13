import type { ImageSize } from "@/features/assets/queries/useImageSize";

type Props = { size: ImageSize | undefined };

export const TilesetSizeValue = ({ size }: Props) => {
    if (!size) return <>Lendo...</>;
    return (
        <>
            {size.w} × {size.h} px
        </>
    );
};
