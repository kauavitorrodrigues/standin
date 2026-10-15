import type { AssetDefinition } from "@standin/contracts";
import { PaletteFamilies } from "./PaletteFamilies";
import { PaletteSearchResults } from "./PaletteSearchResults";

type Props = {
    search: string;
    families: AssetDefinition[];
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
    showNames?: boolean;
    // Why a family cannot be picked, or null when it can.
    getDisabledReason?: (asset: AssetDefinition) => string | null;
};

// The families of the picked category: all of them, or only the ones that
// match the search while there is text. The tabs stay in both cases.
export const PaletteCategoryContent = ({
    search,
    families,
    onPick,
    selectedId,
    showNames,
    getDisabledReason,
}: Props) => {
    if (search.trim() === "") {
        return (
            <PaletteFamilies
                families={families}
                onPick={onPick}
                selectedId={selectedId}
                showNames={showNames}
                getDisabledReason={getDisabledReason}
            />
        );
    }

    return (
        <PaletteSearchResults
            search={search}
            families={families}
            onPick={onPick}
            selectedId={selectedId}
            showNames={showNames}
            getDisabledReason={getDisabledReason}
        />
    );
};
