import type { ReactNode } from "react";

type Props = {
    isVisible: boolean;
    left: number;
    top: number;
    width: number;
    height: number;
    zIndex: number;
    className: string;
    children?: ReactNode;
};

// A rectangle of the lab, in px of the scene. Draws nothing when hidden.
export const LabBox = ({
    isVisible,
    left,
    top,
    width,
    height,
    zIndex,
    className,
    children,
}: Props) => {
    if (!isVisible) return null;

    return (
        <div
            className={`pointer-events-none absolute ${className}`}
            style={{ left, top, width, height, zIndex }}
        >
            {children}
        </div>
    );
};
