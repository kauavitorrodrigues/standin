import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

// One group of a horizontal toolbar. It carries its own padding, so the line
// the toolbar draws between two groups (`divide-x`) runs the full height of
// the bar, from the top border to the bottom one.
export const ToolbarSection = ({ children }: Props) => (
    <div className="flex items-center gap-0.5 p-1">{children}</div>
);
