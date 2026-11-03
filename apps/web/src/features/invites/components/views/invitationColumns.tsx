import type { ColumnDef } from "@tanstack/react-table";
import { CopyIcon, XIcon } from "lucide-react";
import type { OrganizationInvitation } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { formatDay } from "../../utils/date";

type Actions = {
    onCopy: (token: string) => void;
    onCancel: (invitationId: string) => void;
};

export const getInvitationColumns = ({
    onCopy,
    onCancel,
}: Actions): ColumnDef<OrganizationInvitation>[] => [
    {
        id: "email",
        header: "E-mail",
        cell: ({ row }) => (
            <span className="truncate">{row.original.email}</span>
        ),
    },
    {
        id: "expiresAt",
        header: "Vale até",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {formatDay(row.original.expiresAt)}
            </span>
        ),
    },
    {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
            <span className="flex justify-end gap-1">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copiar link do convite"
                    onClick={() => onCopy(row.original.token)}
                >
                    <CopyIcon />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Cancelar convite"
                    onClick={() => onCancel(row.original.id)}
                >
                    <XIcon />
                </Button>
            </span>
        ),
    },
];
