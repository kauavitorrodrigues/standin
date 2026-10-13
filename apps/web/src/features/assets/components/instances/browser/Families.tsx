import type { LibraryFamilySummary } from "@standin/contracts";
import {
    FamiliesErrorState,
    FamiliesLoadingState,
} from "../../views/library/ContentStates";
import { FamilyGrid } from "./FamilyGrid";

type Props = {
    families: LibraryFamilySummary[];
    isLoading: boolean;
    isError: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onLoadMore: () => void;
    selectedId: string | null;
    onSelect: (family: LibraryFamilySummary) => void;
};

// The grid of the library, or why there is none yet.
export const Families = ({ isLoading, isError, ...gridProps }: Props) => {
    if (isLoading) return <FamiliesLoadingState />;
    if (isError) return <FamiliesErrorState />;

    return <FamilyGrid {...gridProps} />;
};
