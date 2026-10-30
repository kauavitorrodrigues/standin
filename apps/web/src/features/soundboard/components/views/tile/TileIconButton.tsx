import type { ReactNode } from "react";
import { TILE_ICON_BUTTON_CLASS } from "../../../consts/tileOverlay";

type Props = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    pressed?: boolean;
    children: ReactNode;
};

// A bare icon over a tile: no box, no padding and no border, just the icon,
// small and filled. Hover and press only dim or shrink it. The keyboard focus
// still draws a ring, so the button stays reachable.
export const TileIconButton = ({
    label,
    onClick,
    disabled = false,
    pressed,
    children,
}: Props) => (
    <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        className={TILE_ICON_BUTTON_CLASS}
    >
        {children}
    </button>
);
