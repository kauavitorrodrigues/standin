import { useEffect, useRef } from "react";
import { nameColor } from "@/features/assets/utils/nameColor";
import { getSheetDominantColor } from "../../utils/admin/getSheetDominantColor";

type AutoColor = { colorHex: string; colorKey: string };

type Params = {
    // The RGBA of the front sheet, or null while there is none.
    pixels: Uint8Array | null;
    // True once the person typed in the field, so it is left alone.
    isHexEdited: boolean;
    isKeyEdited: boolean;
    // Gets only the fields the person did not edit. Set them without marking
    // the form dirty, so the next sheet fills them again.
    onColor: (color: Partial<AutoColor>) => void;
};

// Fills the color of the part (hex and name) from the predominant color of the
// front sheet, again whenever the sheet changes, as the form of an asset does
// with its image. A field the person edited is never overwritten.
export const useSheetAutoColor = ({
    pixels,
    isHexEdited,
    isKeyEdited,
    onColor,
}: Params) => {
    const onColorRef = useRef(onColor);

    useEffect(() => {
        onColorRef.current = onColor;
    });

    useEffect(() => {
        if (!pixels) return;
        const hex = getSheetDominantColor(pixels);
        if (!hex) return;

        const color: Partial<AutoColor> = {};
        if (!isHexEdited) color.colorHex = hex;
        if (!isKeyEdited) color.colorKey = nameColor(hex);
        onColorRef.current(color);
    }, [pixels, isHexEdited, isKeyEdited]);
};
