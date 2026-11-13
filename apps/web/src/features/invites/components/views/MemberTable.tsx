import { useMemo } from "react";
import {
    getCoreRowModel,
    useReactTable,
    type OnChangeFn,
    type PaginationState,
} from "@tanstack/react-table";
import type { OrganizationMemberEntry } from "@standin/contracts";
import { DataTable } from "@/components/data-table/DataTable";
import { getMemberColumns } from "./memberColumns";

type Props = {
    members: OrganizationMemberEntry[];
    total: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
    canRemove: boolean;
    onRemove: (member: OrganizationMemberEntry) => void;
};

export const MemberTable = ({
    members,
    total,
    pagination,
    onPaginationChange,
    canRemove,
    onRemove,
}: Props) => {
    const columns = useMemo(
        () => getMemberColumns({ canRemove, onRemove }),
        [canRemove, onRemove]
    );
    const table = useReactTable({
        data: members,
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
            emptyMessage="Nenhum membro encontrado."
        />
    );
};
