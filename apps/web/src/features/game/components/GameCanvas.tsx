import type { Ref } from "react";
import { blurActiveEditableElement } from "@/features/game/utils/player";

type Props = {
    ref: Ref<HTMLDivElement>;
};

export const GameCanvas = ({ ref }: Props) => (
    <div
        ref={ref}
        className="h-full w-full"
        onPointerDown={blurActiveEditableElement}
    />
);
