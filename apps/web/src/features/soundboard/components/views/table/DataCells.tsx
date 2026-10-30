import type { SoundboardClip } from "@standin/contracts";
import type { ComponentType } from "react";
import type { TableColumn, TableColumnId } from "../../../types/layout";
import {
    DateCell,
    DurationCell,
    NameCell,
    UploaderCell,
    VolumeCell,
} from "./Cells";

type CellsByColumn = Readonly<
    Record<TableColumnId, ComponentType<{ clip: SoundboardClip }>>
>;

const CELLS: CellsByColumn = {
    name: NameCell,
    duration: DurationCell,
    volume: VolumeCell,
    uploader: UploaderCell,
    date: DateCell,
};

type Props = { clip: SoundboardClip; columns: readonly TableColumn[] };

// The cells of a row that hold the data of its clip, the ones the list has
// room for.
export const DataCells = ({ clip, columns }: Props) => (
    <>
        {columns.map((column) => {
            const Cell = CELLS[column.id];
            return <Cell key={column.id} clip={clip} />;
        })}
    </>
);
