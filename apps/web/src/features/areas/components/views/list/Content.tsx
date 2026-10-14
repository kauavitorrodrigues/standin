import type { AreaSummary } from "@standin/contracts";
import {
    AreasEmptyState,
    AreasErrorState,
    AreasNoResultsState,
} from "./ContentStates";
import { AreasGrid } from "./Grid";
import { AreasLoadingState } from "./LoadingState";

type Props = {
    areas: AreaSummary[];
    isLoading: boolean;
    isError: boolean;
    hasSearch: boolean;
};

// The grid, or why there is none: loading, a failure, no area yet or a
// search that matched nothing.
export const AreasContent = ({
    areas,
    isLoading,
    isError,
    hasSearch,
}: Props) => {
    if (isLoading) return <AreasLoadingState />;
    if (isError) return <AreasErrorState />;
    if (areas.length > 0) return <AreasGrid areas={areas} />;
    if (hasSearch) return <AreasNoResultsState />;
    return <AreasEmptyState />;
};
