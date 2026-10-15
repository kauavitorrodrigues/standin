import type { ReactNode } from "react";

export const OptionHint = ({ children }: { children: ReactNode }) => (
    <span className="ml-auto text-xs font-normal opacity-70">{children}</span>
);
