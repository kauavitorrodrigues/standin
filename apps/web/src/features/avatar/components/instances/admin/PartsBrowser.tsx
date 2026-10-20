import { useAvatarPartsBrowser } from "../../../hooks/admin/useAvatarPartsBrowser";
import { PartsFacetsSidebar } from "../../views/admin/filters/PartsFacetsSidebar";
import { ResultsBar } from "../../views/admin/filters/ResultsBar";
import { PartsList } from "../../views/admin/PartsList";

// Sidebar of filters and the grid they narrow down, as in the base and the
// asset library browsers.
export const PartsBrowser = () => {
    const browser = useAvatarPartsBrowser();

    return (
        <div className="flex min-h-0 flex-1">
            <PartsFacetsSidebar
                facets={browser.facets}
                filters={browser.filters}
                onChange={browser.changeFilters}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <ResultsBar
                    total={browser.parts.length}
                    label={{ singular: "peça", plural: "peças" }}
                    chips={browser.chips}
                    onRemoveFilter={browser.changeFilters}
                />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 pt-2">
                    <PartsList parts={browser.parts} />
                </div>
            </div>
        </div>
    );
};
