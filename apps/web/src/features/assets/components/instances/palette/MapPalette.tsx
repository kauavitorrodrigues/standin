import { useForm, useWatch } from "react-hook-form";
import { SearchIcon } from "lucide-react";
import type { AssetDefinition } from "@standin/contracts";
import { Input } from "@/components/ui/input";
import { useMapPalette } from "@/features/assets/queries/useMapPalette";
import { PaletteBody } from "./PaletteBody";

type Props = {
    mapId: string;
    onPick: (asset: AssetDefinition) => void;
};

type SearchValues = { search: string };

// Editor palette: one entry per family, shown by its base, in one tab per
// category that has assets (the server already sends them in order, by
// name), a separate Tiles group, and a search that crosses every category
// and hides the tabs while there is text.
export function MapPalette({ mapId, onPick }: Props) {
    const { tilesets, categories } = useMapPalette(mapId);
    const { register, control } = useForm<SearchValues>({
        defaultValues: { search: "" },
    });
    const search = useWatch({ control, name: "search" });

    return (
        <div className="flex flex-col gap-3">
            <div className="relative">
                <SearchIcon className="text-muted-foreground absolute top-2 left-2 size-4" />
                <Input
                    {...register("search")}
                    placeholder="Buscar peça"
                    className="pl-8"
                />
            </div>
            <PaletteBody
                search={search}
                categories={categories}
                tilesets={tilesets}
                onPick={onPick}
            />
        </div>
    );
}
