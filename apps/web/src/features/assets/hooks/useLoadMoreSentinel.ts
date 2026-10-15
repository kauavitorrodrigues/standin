import { useEffect, useRef } from "react";

type Params = {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onLoadMore: () => void;
};

// A sentinel under the last row of a list that asks for the next page when it
// gets close to the scroll. Put the ref on the element that is the sentinel.
export const useLoadMoreSentinel = ({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
}: Params) => {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!hasNextPage || !sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting && !isFetchingNextPage) onLoadMore();
            },
            { rootMargin: "200px" }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    return sentinelRef;
};
