import { SOUNDBOARD_TABLE_HEADER_HEIGHT_PX } from "../../../consts/listLayout";
import type { ListHeaderProps } from "../../../types/layout";
import { buildTableTemplate } from "../../../utils/buildTableTemplate";
import { getTableColumns } from "../../../utils/getTableColumns";

// The names of the columns, kept above the rows as they scroll. It has the
// columns the rows have, from the same width, so they line up.
export const TableHeader = ({ widthPx }: ListHeaderProps) => {
    const columns = getTableColumns(widthPx);

    return (
        <div
            role="row"
            className="grid items-center gap-2 border-b px-3 text-xs font-medium text-muted-foreground"
            style={{
                height: SOUNDBOARD_TABLE_HEADER_HEIGHT_PX,
                gridTemplateColumns: buildTableTemplate(columns),
            }}
        >
            {columns.map((column) => (
                <span key={column.id} role="columnheader" className="truncate">
                    {column.label}
                </span>
            ))}
            <span role="columnheader" className="sr-only">
                Ações
            </span>
        </div>
    );
};
