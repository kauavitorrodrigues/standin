import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./DataTablePagination";

type Props<TData> = {
    table: TanstackTable<TData>;
    total: number;
    emptyMessage: string;
};

// A table that fills the space it is given: the rows scroll inside it and the
// page controls stay below. The server pages the rows.
export const DataTable = <TData,>({
    table,
    total,
    emptyMessage,
}: Props<TData>) => {
    const rows = table.getRowModel().rows;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2.5">
            {/* The shadow is off so it does not fade the sticky header. */}
            <ScrollArea
                showShadow={false}
                className="min-h-0 flex-1 rounded-lg border"
            >
                <Table containerClassName="overflow-visible rounded-none border-0">
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id}>
                                {group.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
            <DataTablePagination table={table} total={total} />
        </div>
    );
};
