import type { LibraryFamilySummary } from "@standin/contracts";
import { FamilyCard } from "@/features/assets/components/views/card/FamilyCard";
import { FamiliesEmptyState } from "@/features/assets/components/views/library/ContentStates";
import { LoadMoreSentinel } from "@/features/assets/components/views/library/LoadMoreSentinel";
import { LoadingMoreIndicator } from "@/features/assets/components/views/library/LoadingMoreIndicator";
import { useLoadMoreSentinel } from "@/features/assets/hooks/useLoadMoreSentinel";

type Props = {
    families: LibraryFamilySummary[];
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onLoadMore: () => void;
    selectedId: string | null;
    onSelect: (family: LibraryFamilySummary) => void;
};

// The cards loaded so far. A sentinel under the last row asks for the next
// page when it gets close to the scroll.
export const FamilyGrid = ({
    families,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    selectedId,
    onSelect,
}: Props) => {
    const sentinelRef = useLoadMoreSentinel({
        hasNextPage,
        isFetchingNextPage,
        onLoadMore,
    });

    if (families.length === 0) return <FamiliesEmptyState />;

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-3">
                {families.map((family) => (
                    <FamilyCard
                        key={family.familyId}
                        family={family}
                        selected={family.familyId === selectedId}
                        onSelect={() => onSelect(family)}
                    />
                ))}
            </div>
            <LoadMoreSentinel show={hasNextPage} sentinelRef={sentinelRef} />
            <LoadingMoreIndicator show={isFetchingNextPage} />
        </div>
    );
};
