import { LayersIcon } from "lucide-react";
import type { AssetDefinition } from "@standin/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PaletteFamilies } from "@/features/assets/components/views/palette/PaletteFamilies";
import { CATEGORY_ICONS } from "@/features/assets/consts/categoryIcons";
import { TILES_TAB } from "@/features/assets/consts/palette";
import type {
    PaletteCategories,
    PaletteTilesets,
} from "@/features/assets/types/mapPalette";
import { getDefaultPaletteTab } from "@/features/assets/utils/getDefaultPaletteTab";

type Props = {
    categories: PaletteCategories;
    tilesets: PaletteTilesets;
    onPick: (asset: AssetDefinition) => void;
};

// One tab per category that has assets, and a separate Tiles tab.
export const PaletteTabs = ({ categories, tilesets, onPick }: Props) => (
    <Tabs defaultValue={getDefaultPaletteTab(categories)}>
        <TabsList>
            {categories.map(({ category, label, icon }) => (
                <Tooltip key={category}>
                    <TooltipTrigger
                        render={
                            <TabsTrigger
                                value={category}
                                icon={CATEGORY_ICONS[icon]}
                                aria-label={label}
                            />
                        }
                    />
                    <TooltipContent>{label}</TooltipContent>
                </Tooltip>
            ))}
            <TabsTrigger value={TILES_TAB} icon={LayersIcon}>
                Tiles
            </TabsTrigger>
        </TabsList>
        {categories.map(({ category, families }) => (
            <TabsContent key={category} value={category}>
                <PaletteFamilies families={families} onPick={onPick} />
            </TabsContent>
        ))}
        <TabsContent value={TILES_TAB}>
            <ul className="flex flex-col gap-1">
                {tilesets.map(({ id, name, tileCount }) => (
                    <li key={id} className="text-sm">
                        {name} ({tileCount} tiles)
                    </li>
                ))}
            </ul>
        </TabsContent>
    </Tabs>
);
