import type { ReactNode } from "react";

type PanelFooterProps = {
    children: ReactNode;
};

export const PanelFooter = ({ children }: PanelFooterProps) => (
    <div className="flex h-[2.875rem] shrink-0 items-center justify-between border-t px-3">
        {children}
    </div>
);
