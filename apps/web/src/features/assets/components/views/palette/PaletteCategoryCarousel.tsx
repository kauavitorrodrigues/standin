import { CarouselIconItem } from "@/features/editor/components/views/CarouselIconItem";
import { CarouselStrip } from "@/features/editor/components/views/CarouselStrip";
import { CATEGORY_ICONS } from "@/features/assets/consts/categoryIcons";
import type { PaletteCategories } from "@/features/assets/types/mapPalette";
import { PaletteTilesCarouselItem } from "./PaletteTilesCarouselItem";

type Props = {
    categories: PaletteCategories;
    selected: string;
    onSelect: (category: string) => void;
    // Leaves the library's own Tiles entry out.
    hideTilesTab?: boolean;
};

// Every category, even the ones with no asset, as floating icons that the
// chevrons scroll through.
export const PaletteCategoryCarousel = ({
    categories,
    selected,
    onSelect,
    hideTilesTab = false,
}: Props) => (
    <CarouselStrip>
        {categories.map(({ category, label, icon }) => (
            <CarouselIconItem
                key={category}
                icon={CATEGORY_ICONS[icon]}
                label={label}
                selected={category === selected}
                onSelect={() => onSelect(category)}
            />
        ))}
        <PaletteTilesCarouselItem
            selected={selected}
            onSelect={onSelect}
            hidden={hideTilesTab}
        />
    </CarouselStrip>
);
