import type { TableColumn } from "../types/layout";

// The columns of the table that hold a clip's data. They go away from the
// right as the list narrows, so a narrow one keeps the name and the duration.
export const SOUNDBOARD_TABLE_COLUMNS: readonly TableColumn[] = [
    { id: "name", label: "Nome", track: "minmax(0, 1fr)", minListWidthPx: 0 },
    { id: "duration", label: "Duração", track: "4.5rem", minListWidthPx: 0 },
    { id: "volume", label: "Volume", track: "4.5rem", minListWidthPx: 520 },
    {
        id: "uploader",
        label: "Enviado por",
        track: "9rem",
        minListWidthPx: 640,
    },
    { id: "date", label: "Data", track: "6.5rem", minListWidthPx: 760 },
];

// The last column holds the buttons of the row, and is always there.
export const SOUNDBOARD_TABLE_ACTIONS_TRACK = "4.5rem";
