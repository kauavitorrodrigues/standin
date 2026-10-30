import type { ReactNode } from "react";

type Props = { children: ReactNode };

// The last cell of a row: the buttons of the clip, at the right.
export const RowButtons = ({ children }: Props) => (
    <div className="flex items-center justify-end gap-3">{children}</div>
);
