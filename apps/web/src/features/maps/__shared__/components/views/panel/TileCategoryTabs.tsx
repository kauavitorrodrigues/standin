import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TILE_PALETTE_CATEGORIES } from "@/features/maps/__shared__/consts/tilePalette";
import type { PaletteTileCategory } from "@/features/maps/__shared__/types/palette-tile";
import { getTileCategoryMeta } from "@/features/tilesets/consts/categoryMeta";

type TileCategoryTabsProps = {
    value: PaletteTileCategory;
    onValueChange: (category: PaletteTileCategory) => void;
};

// One tab per category, each with the width of the others and its name in
// the tooltip. The grid is outside, so there are no panels.
export const TileCategoryTabs = ({
    value,
    onValueChange,
}: TileCategoryTabsProps) => (
    <Tabs
        value={value}
        onValueChange={(next) => {
            const picked = TILE_PALETTE_CATEGORIES.find(
                (category) => category === next
            );
            if (picked) onValueChange(picked);
        }}
    >
        <TabsList className="w-full">
            {TILE_PALETTE_CATEGORIES.map((category) => {
                const meta = getTileCategoryMeta(category);

                return (
                    <Tooltip key={category}>
                        <TooltipTrigger
                            render={
                                <TabsTrigger
                                    value={category}
                                    icon={meta.icon}
                                    aria-label={meta.label}
                                />
                            }
                        />
                        <TooltipContent>{meta.label}</TooltipContent>
                    </Tooltip>
                );
            })}
        </TabsList>
    </Tabs>
);
