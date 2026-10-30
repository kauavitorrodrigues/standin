import type { ReactNode } from "react";

type Props = { children: ReactNode };

// The play button with the length of the selection right under it.
export const PreviewControls = ({ children }: Props) => (
    <div className="flex shrink-0 flex-col items-center gap-1">{children}</div>
);
