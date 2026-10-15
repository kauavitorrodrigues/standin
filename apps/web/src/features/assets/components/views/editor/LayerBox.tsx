import type { ReactNode } from "react";

type Props = {
    opacity: number;
    children: ReactNode;
};

// One layer of the editor over the image. It covers the image, so its shapes
// are placed like the ones drawn straight on the canvas, and it fades as a
// whole.
export const LayerBox = ({ opacity, children }: Props) => (
    <div className="pointer-events-none absolute inset-0" style={{ opacity }}>
        {children}
    </div>
);
