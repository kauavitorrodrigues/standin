import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SpaceGuestEntry } from "@standin/contracts";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { GUEST_STATE_LABELS } from "../../consts/guestFilters";
import { describeAccessEnd } from "../../utils/guest";

export const getGuestColumns = (
    // The buttons for the state of the guest.
    renderActions: (guest: SpaceGuestEntry) => ReactNode
): ColumnDef<SpaceGuestEntry>[] => [
    {
        id: "name",
        header: "Nome",
        cell: ({ row }) => (
            <span className="flex items-center gap-2">
                <UserAvatar
                    id={row.original.userId}
                    name={row.original.name}
                    avatar={row.original.profilePictureUrl}
                />
                <span className="truncate text-sm">{row.original.name}</span>
            </span>
        ),
    },
    {
        id: "state",
        header: "Estado",
        cell: ({ row }) => (
            <Badge variant="secondary">
                {GUEST_STATE_LABELS[row.original.state]}
            </Badge>
        ),
    },
    {
        id: "expiresAt",
        header: "Acesso até",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {describeAccessEnd(row.original.expiresAt)}
            </span>
        ),
    },
    {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
            <span className="flex justify-end gap-2">
                {renderActions(row.original)}
            </span>
        ),
    },
];
