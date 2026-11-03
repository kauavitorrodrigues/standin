import { useMemo, type ReactNode } from "react";
import {
    getCoreRowModel,
    useReactTable,
    type OnChangeFn,
    type PaginationState,
} from "@tanstack/react-table";
import type { SpaceGuestEntry } from "@standin/contracts";
import { DataTable } from "@/components/data-table/DataTable";
import { getGuestColumns } from "./guestColumns";

type Props = {
    guests: SpaceGuestEntry[];
    total: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
    renderActions: (guest: SpaceGuestEntry) => ReactNode;
};

export const GuestTable = ({
    guests,
    total,
    pagination,
    onPaginationChange,
    renderActions,
}: Props) => {
    const columns = useMemo(
        () => getGuestColumns(renderActions),
        [renderActions]
    );
    const table = useReactTable({
        data: guests,
        columns,
        pageCount: Math.ceil(total / pagination.pageSize),
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange,
        state: { pagination },
    });

    return (
        <DataTable
            table={table}
            total={total}
            emptyMessage="Nenhum convidado encontrado."
        />
    );
};
