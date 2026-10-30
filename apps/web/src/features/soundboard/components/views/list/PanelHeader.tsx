import type { ReactNode } from "react";

type Props = { children: ReactNode };

// The top of the panel: the search takes the room, the upload sits at the end.
export const PanelHeader = ({ children }: Props) => (
    <div className="flex items-center gap-2">{children}</div>
);
