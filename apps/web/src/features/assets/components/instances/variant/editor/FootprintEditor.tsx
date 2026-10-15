import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { SpriteEditor } from "@/features/assets/components/instances/editor/SpriteEditor";
import { useVariantGeometry } from "@/features/assets/hooks/useVariantGeometry";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";
import {
    NO_FOOTPRINT_MASK,
    NO_SOLID_MASK,
} from "@/features/assets/consts/footprintMask";
import type {
    FootprintMasks,
    FootprintTile,
} from "@/features/assets/types/footprintMask";
import { canHaveMask } from "@/features/assets/utils/footprintMask";
import { toggleTileMasks } from "@/features/assets/utils/solidMask";
import type { Footprint } from "@/features/assets/types/spriteGeometry";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    file: File;
    frameCount: number;
    solid: boolean;
    disabled: boolean;
    leading?: ReactNode;
};

// The visual editor of the creation page, for the footprint of a new
// rotation. Only the footprint is marked, and it is kept in the fields of the
// form, like the numbers it replaces.
export const FootprintEditor = ({
    form,
    file,
    frameCount,
    solid,
    disabled,
    leading,
}: Props) => {
    const { crop, footprint, mask, solidMask } = useVariantGeometry(
        form,
        file,
        frameCount
    );

    const setFootprint = (next: Footprint) => {
        form.setValue("footprintW", next.w);
        form.setValue("footprintH", next.h);
        form.setValue("footprintOffsetX", next.offsetX);
        form.setValue("footprintMask", NO_FOOTPRINT_MASK);
        form.setValue("footprintSolidMask", NO_SOLID_MASK);
        form.clearErrors(["footprintW", "footprintH"]);
    };
    const setMasks = (next: FootprintMasks) => {
        form.setValue("footprintMask", next.mask);
        form.setValue("footprintSolidMask", next.solidMask);
    };
    // Freeing a tile also empties the solid cells inside it.
    const toggleTile = (tile: FootprintTile) => {
        setMasks(
            toggleTileMasks(
                footprint,
                {
                    mask: form.getValues("footprintMask"),
                    solidMask: form.getValues("footprintSolidMask"),
                },
                tile
            )
        );
    };
    // A footprint of a single tile, or of an animated asset, has no mask.
    const getTileToggle = () => {
        if (frameCount > 1 || !canHaveMask(footprint)) return undefined;
        return toggleTile;
    };

    return (
        <SpriteEditor
            file={file}
            crop={crop}
            frameCount={frameCount}
            footprint={footprint}
            mask={mask}
            solidMask={solidMask}
            onChangeSolid={setMasks}
            onToggleTile={getTileToggle()}
            solid={solid}
            footprintOnly
            fill
            leading={leading}
            disabled={disabled}
            onMarkFootprint={setFootprint}
            onRemoveImage={() => form.setValue("image", [])}
        />
    );
};
