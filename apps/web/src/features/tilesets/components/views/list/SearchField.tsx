import { SearchIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { TilesetSearchFormValues } from "../../../types/searchForm";

type Props = { form: UseFormReturn<TilesetSearchFormValues> };

export const TilesetSearchField = ({ form }: Props) => (
    <div className="relative w-64 max-w-full">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
            {...form.register("search")}
            placeholder="Buscar tilesets"
            aria-label="Buscar tilesets"
            className="h-7 pl-8 text-sm"
        />
    </div>
);
