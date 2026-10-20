import type { AvatarPartRow } from "@standin/contracts";

// What names a row in a family: its color, or "Padrão" for the row of a part
// that has no color.
export const getRowTitle = (row: AvatarPartRow): string =>
    row.colorKey ?? "Padrão";
