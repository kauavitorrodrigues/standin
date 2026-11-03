import type { Table } from "@tanstack/react-table";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TABLE_PAGE_SIZE_OPTIONS } from "@/consts/dataTable";

type Props<TData> = {
    table: Table<TData>;
    // How many rows the list has in all, as the server counted them.
    total: number;
};

// Page controls of a table that the server pages.
export const DataTablePagination = <TData,>({ table, total }: Props<TData>) => {
    const { pageIndex, pageSize } = table.getState().pagination;

    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2 px-1 text-sm">
            <p className="text-muted-foreground">{total} resultado(s)</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                    <p className="font-medium whitespace-nowrap">
                        Linhas por página
                    </p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) =>
                            table.setPageSize(Number(value))
                        }
                    >
                        <SelectTrigger className="h-8 w-[4.5rem]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TABLE_PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <p className="font-medium">
                    Página {pageIndex + 1} de{" "}
                    {Math.max(table.getPageCount(), 1)}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        aria-label="Primeira página"
                        variant="outline"
                        size="icon"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeftIcon />
                    </Button>
                    <Button
                        aria-label="Página anterior"
                        variant="outline"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        aria-label="Próxima página"
                        variant="outline"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRightIcon />
                    </Button>
                    <Button
                        aria-label="Última página"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRightIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};
