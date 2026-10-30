import { SOUNDBOARD_TABLE_COLUMNS } from "../consts/tableColumns";
import type { TableColumn } from "../types/layout";

/** The columns of the table a list this wide has room for, in order. */
export const getTableColumns = (widthPx: number): readonly TableColumn[] =>
    SOUNDBOARD_TABLE_COLUMNS.filter(
        (column) => widthPx >= column.minListWidthPx
    );
