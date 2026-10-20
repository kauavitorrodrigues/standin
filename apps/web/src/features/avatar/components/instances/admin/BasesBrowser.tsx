import { BasesList } from "../../views/admin/BasesList";
import { FacetsSidebar } from "../../views/admin/filters/FacetsSidebar";
import { ResultsBar } from "../../views/admin/filters/ResultsBar";
import { useAvatarBasesBrowser } from "../../../hooks/admin/useAvatarBasesBrowser";

// Sidebar of filters and the list they narrow down, as in the asset
// library: the negative margin of the page content lets the sidebar touch
// the top, the bottom and the left edge.
export const BasesBrowser = () => {
    const browser = useAvatarBasesBrowser();

    return (
        <div className="flex min-h-0 flex-1">
            <FacetsSidebar
                facets={browser.facets}
                filters={browser.filters}
                onChange={browser.changeFilters}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <ResultsBar
                    total={browser.bases.length}
                    label={{ singular: "base", plural: "bases" }}
                    chips={browser.chips}
                    onRemoveFilter={browser.changeFilters}
                />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 pt-2">
                    <BasesList bases={browser.bases} />
                </div>
            </div>
        </div>
    );
};
