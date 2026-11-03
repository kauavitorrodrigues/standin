import {
    getCoreRowModel,
    useReactTable,
    type OnChangeFn,
    type PaginationState,
} from "@tanstack/react-table";
import type { OrganizationMemberEntry } from "@standin/contracts";
import { DataTable } from "@/components/data-table/DataTable";
import { memberColumns } from "./memberColumns";

type Props = {
    members: OrganizationMemberEntry[];
    total: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
};

export const MemberTable = ({
    members,
    total,
    pagination,
    onPaginationChange,
}: Props) => {
    const table = useReactTable({
        data: members,
        columns: memberColumns,
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
            emptyMessage="Nenhum membro encontrado."
        />
    );
};
