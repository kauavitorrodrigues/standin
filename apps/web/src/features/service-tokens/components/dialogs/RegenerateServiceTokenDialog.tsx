import type { ServiceToken } from "@standin/contracts";
import {
    SERVICE_TOKEN_ERROR_MESSAGES,
    SERVICE_TOKEN_REGENERATE_TEXT,
} from "../../consts/messages";
import { useConfirmTokenAction } from "../../hooks/useConfirmTokenAction";
import { useRegenerateServiceToken } from "../../mutations/useRegenerateServiceToken";
import { ConfirmTokenDialog } from "./ConfirmTokenDialog";

type Props = {
    serviceToken: ServiceToken;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Gets the new clear token, which is shown once by the caller.
    onRegenerated: (token: string) => void;
};

export const RegenerateServiceTokenDialog = ({
    serviceToken,
    open,
    onOpenChange,
    onRegenerated,
}: Props) => {
    const regenerate = useRegenerateServiceToken();
    const { confirm } = useConfirmTokenAction({
        perform: async () => {
            const token = await regenerate.mutateAsync(serviceToken.id);
            // The mutation must not keep the secret either.
            regenerate.reset();
            return token;
        },
        failedMessage: SERVICE_TOKEN_ERROR_MESSAGES.REGENERATE_FAILED,
        onDone: (token) => {
            onOpenChange(false);
            onRegenerated(token);
        },
    });

    return (
        <ConfirmTokenDialog
            open={open}
            onOpenChange={onOpenChange}
            title={SERVICE_TOKEN_REGENERATE_TEXT.TITLE}
            description={SERVICE_TOKEN_REGENERATE_TEXT.describe(
                serviceToken.name
            )}
            cancelLabel={SERVICE_TOKEN_REGENERATE_TEXT.CANCEL}
            confirmLabel={SERVICE_TOKEN_REGENERATE_TEXT.CONFIRM}
            confirmVariant="default"
            pending={regenerate.isPending}
            onConfirm={confirm}
        />
    );
};
