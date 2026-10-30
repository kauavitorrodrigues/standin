import type { TilesRowProps } from "../../types/layout";
import { TableClipRow } from "./TableClipRow";

// The line of the table: one clip, since the table has one column of clips.
export const TableTilesRow = ({ row, widthPx }: TilesRowProps) => (
    <>
        {row.clips.map((clip) => (
            <TableClipRow key={clip.id} clip={clip} widthPx={widthPx} />
        ))}
    </>
);
