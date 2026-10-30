import type { TilesRowProps } from "../../../types/layout";
import { ClipTile } from "../../instances/ClipTile";

// One line of tiles of the panel. The columns are the same on every line, so a short last
// line leaves its tiles where the ones above are.
export const TilesRow = ({ row, columns, Overlay, Actions }: TilesRowProps) => (
    <ul
        className="grid h-11 gap-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
        {row.clips.map((clip) => (
            <ClipTile
                key={clip.id}
                clip={clip}
                Overlay={Overlay}
                Actions={Actions}
            />
        ))}
    </ul>
);
