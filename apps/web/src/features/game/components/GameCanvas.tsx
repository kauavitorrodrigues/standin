import type { Ref } from "react";

type Props = {
    ref: Ref<HTMLDivElement>;
};

export const GameCanvas = ({ ref }: Props) => (
    <div ref={ref} className="h-full w-full" />
);
