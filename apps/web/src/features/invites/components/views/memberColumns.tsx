import { EllipsisIcon, UserMinusIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { OrganizationMemberEntry } from "@standin/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { formatDay } from "../../utils/date";

// Shown on hover or focus of the row, and always on touch screens and while the
// menu is open.
const ACTIONS_TRIGGER_CLASS =
    "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 [@media(hover:none)]:opacity-100";

type Actions = {
    // Only the owner removes people.
    canRemove: boolean;
    onRemove: (member: OrganizationMemberEntry) => void;
};

export const getMemberColumns = ({
    canRemove,
    onRemove,
}: Actions): ColumnDef<OrganizationMemberEntry>[] => [
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
    {
        id: "actions",
        header: () => null,
        // The owner is never removed, so their row has no action.
        cell: ({ row }) =>
            !canRemove || row.original.isOwner ? null : (
                <span className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Ações"
                                    className={ACTIONS_TRIGGER_CLASS}
                                />
                            }
                        >
                            <EllipsisIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-55">
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onRemove(row.original)}
                            >
                                <UserMinusIcon />
                                Remover da organização
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </span>
            ),
    },
];
