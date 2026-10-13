import { cn } from "@/lib/utils";
import { Families } from "@/features/assets/components/instances/browser/Families";
import { FamilyDetailsSlot } from "@/features/assets/components/views/details/FamilyDetailsSlot";
import { LibraryFacetsSidebar } from "@/features/assets/components/views/filters/LibraryFacetsSidebar";
import { ResultsBar } from "@/features/assets/components/views/filters/ResultsBar";
import { useAssetsBrowser } from "@/features/assets/hooks/useAssetsBrowser";

// Sidebar of filters and the grid they narrow down, each with its own
// request. Only the list receives the filters. The negative margin
// cancels the padding of the page content so the sidebar touches the top,
// the bottom and the left edge.
export const Browser = () => {
    const browser = useAssetsBrowser();
    const { list } = browser;

    return (
        <div className="flex min-h-0 flex-1">
            <LibraryFacetsSidebar
                facets={browser.facets}
                filters={browser.filters}
                onChange={browser.changeFilters}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <ResultsBar
                    total={list.total}
                    chips={browser.chips}
                    onRemoveFilter={browser.changeFilters}
                />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 pt-2">
                    <Families
                        families={list.families}
                        isLoading={list.isLoading}
                        isError={list.isError}
                        hasNextPage={list.hasNextPage}
                        isFetchingNextPage={list.isFetchingNextPage}
                        onLoadMore={list.fetchNextPage}
                        selectedId={browser.selectedId}
                        onSelect={(family) => browser.select(family.familyId)}
                    />
                </div>
            </div>
            <div
                inert={!browser.selected}
                className={cn(
                    "relative flex shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-out",
                    browser.selected ? "w-96 opacity-100" : "w-0 opacity-0"
                )}
            >
                <FamilyDetailsSlot
                    family={browser.shown}
                    onClose={browser.closePanel}
                />
            </div>
        </div>
    );
};
