import type { ReactNode } from "react";

type Props = { children: ReactNode };
export const Controls = ({ children }: Props) => {
    return <div className="flex items-center gap-2">{children}</div>;
};
