import type { ReactNode } from "react";

type FrameProps = {
    mapId: string;
    children: ReactNode;
};

export const Frame = ({ mapId, children }: FrameProps) => (
    <div className="flex h-dvh w-full flex-col" data-map-id={mapId}>
        {children}
    </div>
);
