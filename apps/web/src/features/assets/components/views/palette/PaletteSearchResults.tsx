import { searchFamilies, type AssetDefinition } from "@standin/contracts";
import { PaletteFamilies } from "./PaletteFamilies";
import { PaletteSearchEmptyState } from "./PaletteStates";

type Props = {
    search: string;
    families: AssetDefinition[];
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
};

// Matches of the search across every category.
export const PaletteSearchResults = ({
    search,
    families,
    onPick,
    selectedId,
}: Props) => {
    const results = searchFamilies(families, search);
    if (results.length === 0) return <PaletteSearchEmptyState />;

    return (
        <PaletteFamilies
            families={results}
            onPick={onPick}
            selectedId={selectedId}
        />
    );
};
