import { Button } from "@/components/ui/button";
import { JOIN_TEXTS } from "../../consts/messages";

type Props = {
    isPending: boolean;
    errorMessage: string | null;
    // Offered when the account is not the invited one.
    canSwitchAccount: boolean;
    isSwitching: boolean;
    onAccept: () => void;
    onSwitchAccount: () => void;
};

export function AcceptInvitationForm({
    isPending,
    errorMessage,
    canSwitchAccount,
    isSwitching,
    onAccept,
    onSwitchAccount,
}: Props) {
    return (
        <div className="flex flex-col gap-3">
            {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            <Button size="lg" disabled={isPending} onClick={onAccept}>
                {JOIN_TEXTS.accept}
            </Button>
            {canSwitchAccount && (
                <Button
                    variant="outline"
                    disabled={isSwitching}
                    onClick={onSwitchAccount}
                >
                    {JOIN_TEXTS.useOtherAccount}
                </Button>
            )}
        </div>
    );
}
