import type { RefObject } from "react";

type Props = {
    // There is nothing to ask for once every page is loaded.
    show: boolean;
    sentinelRef: RefObject<HTMLDivElement | null>;
};

export const LoadMoreSentinel = ({ show, sentinelRef }: Props) => {
    if (!show) return null;
    return <div ref={sentinelRef} className="h-1" />;
};
