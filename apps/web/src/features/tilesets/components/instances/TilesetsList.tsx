import { TilesetFacetsSidebar } from "../views/list/FacetsSidebar";
import { TilesetResultsBar } from "../views/list/ResultsBar";
import { TilesetsContent } from "../views/list/Content";
import { TilesetsEmptyState } from "../views/list/EmptyState";
import { TilesetsErrorState } from "../views/list/ErrorState";
import { TilesetsLoadingState } from "../views/list/LoadingState";
import { useTilesetsBrowser } from "../../hooks/useBrowser";

// Sidebar of filters and the grid they narrow down, as in the library of
// assets, with the search above the grid.
export const TilesetsList = () => {
    const browser = useTilesetsBrowser();
    const { list } = browser;

    if (list.isLoading) return <TilesetsLoadingState />;
    if (list.isError) return <TilesetsErrorState />;
    if (list.total === 0 && !browser.hasFilters) return <TilesetsEmptyState />;
    if (!list.facets) return <TilesetsLoadingState />;

    return (
        <div className="flex min-h-0 flex-1">
            <TilesetFacetsSidebar
                facets={list.facets}
                filters={browser.filters}
                onChange={browser.changeFilters}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <TilesetResultsBar
                    total={list.total}
                    searchForm={browser.searchForm}
                    chips={browser.chips}
                    onRemoveFilter={browser.changeFilters}
                />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 pt-2">
                    <TilesetsContent tilesets={list.tilesets} />
                </div>
            </div>
        </div>
    );
};
