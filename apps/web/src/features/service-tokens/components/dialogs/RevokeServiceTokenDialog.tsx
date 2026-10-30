import type { ServiceToken } from "@standin/contracts";
import {
    SERVICE_TOKEN_ERROR_MESSAGES,
    SERVICE_TOKEN_REVOKE_TEXT,
} from "../../consts/messages";
import { useConfirmTokenAction } from "../../hooks/useConfirmTokenAction";
import { useRevokeServiceToken } from "../../mutations/useRevokeServiceToken";
import { ConfirmTokenDialog } from "./ConfirmTokenDialog";

type Props = {
    serviceToken: ServiceToken;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const RevokeServiceTokenDialog = ({
    serviceToken,
    open,
    onOpenChange,
}: Props) => {
    const revoke = useRevokeServiceToken();
    const { confirm } = useConfirmTokenAction({
        perform: () => revoke.mutateAsync(serviceToken.id),
        failedMessage: SERVICE_TOKEN_ERROR_MESSAGES.REVOKE_FAILED,
        onDone: () => onOpenChange(false),
    });

    return (
        <ConfirmTokenDialog
            open={open}
            onOpenChange={onOpenChange}
            title={SERVICE_TOKEN_REVOKE_TEXT.TITLE}
            description={SERVICE_TOKEN_REVOKE_TEXT.describe(serviceToken.name)}
            cancelLabel={SERVICE_TOKEN_REVOKE_TEXT.CANCEL}
            confirmLabel={SERVICE_TOKEN_REVOKE_TEXT.CONFIRM}
            pending={revoke.isPending}
            onConfirm={confirm}
        />
    );
};
