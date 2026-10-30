import type { ServiceToken } from "@standin/contracts";
import {
    SERVICE_TOKEN_DELETE_TEXT,
    SERVICE_TOKEN_ERROR_MESSAGES,
} from "../../consts/messages";
import { useConfirmTokenAction } from "../../hooks/useConfirmTokenAction";
import { useDeleteServiceToken } from "../../mutations/useDeleteServiceToken";
import { getTokenStatus } from "../../utils/getTokenStatus";
import { ConfirmTokenDialog } from "./ConfirmTokenDialog";

type Props = {
    serviceToken: ServiceToken;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    now?: Date;
};

export const DeleteServiceTokenDialog = ({
    serviceToken,
    open,
    onOpenChange,
    now,
}: Props) => {
    const remove = useDeleteServiceToken();
    const { confirm } = useConfirmTokenAction({
        perform: () => remove.mutateAsync(serviceToken.id),
        failedMessage: SERVICE_TOKEN_ERROR_MESSAGES.DELETE_FAILED,
        onDone: () => onOpenChange(false),
    });
    const isActive = getTokenStatus(serviceToken, now) === "active";

    return (
        <ConfirmTokenDialog
            open={open}
            onOpenChange={onOpenChange}
            title={SERVICE_TOKEN_DELETE_TEXT.TITLE}
            description={
                isActive
                    ? `${SERVICE_TOKEN_DELETE_TEXT.describe(serviceToken.name)} ${SERVICE_TOKEN_DELETE_TEXT.ACTIVE_WARNING}`
                    : SERVICE_TOKEN_DELETE_TEXT.describe(serviceToken.name)
            }
            cancelLabel={SERVICE_TOKEN_DELETE_TEXT.CANCEL}
            confirmLabel={SERVICE_TOKEN_DELETE_TEXT.CONFIRM}
            pending={remove.isPending}
            onConfirm={confirm}
        />
    );
};
