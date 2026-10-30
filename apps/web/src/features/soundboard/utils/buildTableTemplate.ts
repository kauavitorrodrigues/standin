import { SOUNDBOARD_TABLE_ACTIONS_TRACK } from "../consts/tableColumns";
import type { TableColumn } from "../types/layout";

/** The grid template of a table row and of its header, the buttons last. */
export const buildTableTemplate = (columns: readonly TableColumn[]): string =>
    [
        ...columns.map((column) => column.track),
        SOUNDBOARD_TABLE_ACTIONS_TRACK,
    ].join(" ");
