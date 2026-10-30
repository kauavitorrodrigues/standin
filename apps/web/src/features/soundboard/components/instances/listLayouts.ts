import { SOUNDBOARD_TABLE_ROW_HEIGHT_PX } from "../../consts/listLayout";
import { SOUNDBOARD_TILE_ROW_HEIGHT_PX } from "../../consts/grid";
import type { ClipListLayout } from "../../types/layout";
import { getColumnCount } from "../../utils/getColumnCount";
import { NoListHeader } from "../views/list/NoHeader";
import { TilesRow } from "../views/list/TilesRow";
import { TableHeader } from "../views/table/TableHeader";
import { TableTilesRow } from "./TableTilesRow";

// The tiles of the panel and of the dialog of a space: three to a line or two.
export const PANEL_LIST_LAYOUT: ClipListLayout = {
    getColumnCount,
    getTilesRowHeight: () => SOUNDBOARD_TILE_ROW_HEIGHT_PX,
    TilesRow,
    Header: NoListHeader,
};

// One clip to a row, with its columns under a header. The management pages
// show the clips this way and no other.
export const TABLE_LIST_LAYOUT: ClipListLayout = {
    getColumnCount: () => 1,
    getTilesRowHeight: () => SOUNDBOARD_TABLE_ROW_HEIGHT_PX,
    TilesRow: TableTilesRow,
    Header: TableHeader,
};
