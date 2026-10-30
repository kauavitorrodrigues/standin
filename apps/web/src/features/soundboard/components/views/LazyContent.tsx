import type { ReactNode } from "react";

type Props = { mounted: boolean; children: ReactNode };

// Holds back what it wraps until it is first wanted.
export const LazyContent = ({ mounted, children }: Props) => {
    if (!mounted) return null;
    return children;
};
