import type { ColumnDef } from "@tanstack/react-table";
import type { OrganizationMemberEntry } from "@standin/contracts";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { formatDay } from "../../utils/date";

export const memberColumns: ColumnDef<OrganizationMemberEntry>[] = [
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
                <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm">
                        {row.original.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                        {row.original.email}
                    </span>
                </span>
            </span>
        ),
    },
    {
        id: "role",
        header: "Papel",
        cell: ({ row }) => (
            <Badge variant={row.original.isOwner ? "default" : "secondary"}>
                {row.original.isOwner ? "Dono" : "Membro"}
            </Badge>
        ),
    },
    {
        id: "joinedAt",
        header: "Entrou em",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {formatDay(row.original.joinedAt)}
            </span>
        ),
    },
];
