import type { ReactNode } from "react";

type FrameProps = {
    children: ReactNode;
};

export const Frame = ({ children }: FrameProps) => (
    <div className="flex h-dvh w-full flex-col">{children}</div>
);
