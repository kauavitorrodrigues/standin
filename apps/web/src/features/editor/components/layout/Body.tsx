import type { ReactNode } from "react";

type BodyProps = {
    children: ReactNode;
};

export const Body = ({ children }: BodyProps) => (
    <div className="flex min-h-0 flex-1">{children}</div>
);
