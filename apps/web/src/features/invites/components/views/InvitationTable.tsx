import { useMemo } from "react";
import {
    getCoreRowModel,
    useReactTable,
    type OnChangeFn,
    type PaginationState,
} from "@tanstack/react-table";
import type { OrganizationInvitation } from "@standin/contracts";
import { DataTable } from "@/components/data-table/DataTable";
import { getInvitationColumns } from "./invitationColumns";

type Props = {
    invitations: OrganizationInvitation[];
    total: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
    onCopy: (token: string) => void;
    onCancel: (invitationId: string) => void;
};

export const InvitationTable = ({
    invitations,
    total,
    pagination,
    onPaginationChange,
    onCopy,
    onCancel,
}: Props) => {
    const columns = useMemo(
        () => getInvitationColumns({ onCopy, onCancel }),
        [onCopy, onCancel]
    );
    const table = useReactTable({
        data: invitations,
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
            emptyMessage="Nenhum convite pendente."
        />
    );
};
