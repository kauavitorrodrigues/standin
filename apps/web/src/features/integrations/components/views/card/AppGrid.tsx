import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

// The cards of the apps, side by side when there is room.
export const AppGrid = ({ children }: Props) => (
    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">{children}</div>
);
