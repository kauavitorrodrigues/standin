import { useAreasBrowser } from "../../hooks/useBrowser";
import { AreasContent } from "../views/list/Content";
import { AreaSearchField } from "../views/list/SearchField";

// The search above the grid of areas.
export const AreasList = () => {
    const { searchForm, list, hasSearch, showSearch } = useAreasBrowser();

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <AreaSearchField form={searchForm} visible={showSearch} />
            <AreasContent
                areas={list.areas}
                isLoading={list.isLoading}
                isError={list.isError}
                hasSearch={hasSearch}
            />
        </div>
    );
};
