import type { ServiceToken } from "@standin/contracts";
import type { ServiceTokenAction } from "../../types";
import { DeleteServiceTokenDialog } from "./DeleteServiceTokenDialog";
import { RegenerateServiceTokenDialog } from "./RegenerateServiceTokenDialog";
import { RevokeServiceTokenDialog } from "./RevokeServiceTokenDialog";

type Props = {
    serviceToken: ServiceToken;
    action: ServiceTokenAction;
    onOpenChange: (open: boolean) => void;
    // Gets the new clear token of a regeneration, shown once by the caller.
    onRegenerated: (token: string) => void;
    now?: Date;
};

// The dialog the menu of a row opened, if any.
export const ServiceTokenActionDialogs = ({
    serviceToken,
    action,
    onOpenChange,
    onRegenerated,
    now,
}: Props) => {
    switch (action) {
        case "regenerate":
            return (
                <RegenerateServiceTokenDialog
                    serviceToken={serviceToken}
                    open
                    onOpenChange={onOpenChange}
                    onRegenerated={onRegenerated}
                />
            );
        case "revoke":
            return (
                <RevokeServiceTokenDialog
                    serviceToken={serviceToken}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "delete":
            return (
                <DeleteServiceTokenDialog
                    serviceToken={serviceToken}
                    open
                    onOpenChange={onOpenChange}
                    now={now}
                />
            );
        default:
            return null;
    }
};
