import type { Ref } from "react";
import { WebglNotice } from "@/features/game/components/WebglNotice";
import { blurActiveEditableElement } from "@/features/game/utils/player";

type Props = {
    ref: Ref<HTMLDivElement>;
};

export const GameCanvas = ({ ref }: Props) => (
    <div className="relative h-full w-full">
        <div
            ref={ref}
            className="h-full w-full"
            onPointerDown={blurActiveEditableElement}
        />
        <WebglNotice />
    </div>
);
