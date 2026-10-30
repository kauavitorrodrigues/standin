import type { ReactNode } from "react";

type Props = { children: ReactNode };

// What sits above the rows. It reserves the room of the scrollbar of the list
// below it, so the two are the same width and the columns line up.
export const ListHeaderFrame = ({ children }: Props) => (
    <div className="overflow-hidden [scrollbar-gutter:stable]">{children}</div>
);
