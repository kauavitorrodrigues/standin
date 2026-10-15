import type { LucideIcon } from "lucide-react";
import { getMarkFill } from "../../../../utils/editor/getMarkFill";

type Props = {
    show: boolean;
    icon: LucideIcon;
    // Side of the mark, in px.
    size: number;
    filled?: boolean;
};

// One mark of a tile. Nothing is drawn when the tile does not say it.
export const TileMark = ({ show, icon: Icon, size, filled = false }: Props) => {
    if (!show) return null;

    return (
        <Icon
            fill={getMarkFill(filled)}
            style={{ width: size, height: size }}
        />
    );
};
