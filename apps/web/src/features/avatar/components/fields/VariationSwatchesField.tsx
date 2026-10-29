import type {
    AvatarCategoryPartItem,
    AvatarCategoryPartVariation,
} from "../../types/editor";
import { usePrefetchSheets } from "../../hooks/usePrefetchSheets";
import { getSwatchVariations } from "../../utils/draft";
import { ColorSwatch } from "../views/ColorSwatch";

type VariationSwatchesFieldProps = {
    slot: string;
    // The chosen part when it is in the loaded pages.
    family: AvatarCategoryPartItem | undefined;
    selectedId: string | null;
    onSelect: (
        item: AvatarCategoryPartItem,
        variation: AvatarCategoryPartVariation
    ) => void;
};

// The colors the chosen part is registered with, below the grid. A part of a
// single color, or one that is not loaded yet, shows nothing.
export const VariationSwatchesField = ({
    slot,
    family,
    selectedId,
    onSelect,
}: VariationSwatchesFieldProps) => {
    const variations = getSwatchVariations(family);
    usePrefetchSheets(variations.map((variation) => variation.url));
    if (!family || variations.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 rounded-xl bg-muted p-3">
            {variations.map((variation) => (
                <ColorSwatch
                    key={variation.id}
                    slot={slot}
                    variation={variation}
                    isSelected={variation.id === selectedId}
                    onSelect={(next) => onSelect(family, next)}
                />
            ))}
        </div>
    );
};
