import { useState } from "react";
import {
    BanIcon,
    EllipsisVerticalIcon,
    RefreshCwIcon,
    Trash2Icon,
} from "lucide-react";
import type { ServiceToken } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SERVICE_TOKEN_CREATED_TEXT,
    SERVICE_TOKEN_TABLE_TEXT,
} from "../../consts/messages";
import type { ServiceTokenAction } from "../../types";
import { getTokenActions } from "../../utils/getTokenActions";
import { getTokenStatus } from "../../utils/getTokenStatus";
import { CreatedTokenDialog } from "../dialogs/CreatedTokenDialog";
import { ServiceTokenActionDialogs } from "../dialogs/ServiceTokenActionDialogs";

type Props = { serviceToken: ServiceToken; now?: Date };

// The menu of a row: only the actions the status of the token allows. One
// state holds the dialog that is open. The new secret of a regeneration lives
// in its own state, only until its dialog is closed.
export const ServiceTokenActions = ({ serviceToken, now }: Props) => {
    const [action, setAction] = useState<ServiceTokenAction>(null);
    const [newToken, setNewToken] = useState<string | null>(null);
    const actions = getTokenActions(getTokenStatus(serviceToken, now));
    const close = (next: boolean) => {
        if (!next) setAction(null);
    };

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                >
                    <EllipsisVerticalIcon />
                    <span className="sr-only">
                        {`${SERVICE_TOKEN_TABLE_TEXT.ACTIONS} ${serviceToken.name}`}
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    {actions.canRegenerate && (
                        <DropdownMenuItem
                            onClick={() => setAction("regenerate")}
                        >
                            <RefreshCwIcon />
                            {SERVICE_TOKEN_TABLE_TEXT.REGENERATE}
                        </DropdownMenuItem>
                    )}
                    {actions.canRevoke && (
                        <DropdownMenuItem onClick={() => setAction("revoke")}>
                            <BanIcon />
                            {SERVICE_TOKEN_TABLE_TEXT.REVOKE}
                        </DropdownMenuItem>
                    )}
                    {actions.canDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setAction("delete")}
                            >
                                <Trash2Icon />
                                {SERVICE_TOKEN_TABLE_TEXT.DELETE}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <ServiceTokenActionDialogs
                serviceToken={serviceToken}
                action={action}
                onOpenChange={close}
                onRegenerated={setNewToken}
                now={now}
            />
            <CreatedTokenDialog
                token={newToken}
                title={SERVICE_TOKEN_CREATED_TEXT.REGENERATED_TITLE}
                onClose={() => setNewToken(null)}
            />
        </div>
    );
};
