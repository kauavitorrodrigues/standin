import { SPACE_GUEST_ACCESS } from "@standin/contracts";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { GuestMessages } from "../../consts/messages";
import { GuestMutations } from "../../mutations";
import { GuestQueries } from "../../queries";

const toGuestAccess = (allowed: boolean) => {
    if (allowed) return SPACE_GUEST_ACCESS.ALLOWED;
    return SPACE_GUEST_ACCESS.DISABLED;
};

// Turning it off denies the waiting requests and sends out the guests inside.
export const GuestAccessSwitch = ({ spaceId }: { spaceId: string }) => {
    const { space } = GuestQueries.useSpaceView(spaceId);
    const setAccess = GuestMutations.setAccess(spaceId);

    const change = (allowed: boolean) =>
        setAccess.mutate(toGuestAccess(allowed), {
            onError: () =>
                toast.add({ title: GuestMessages.accessFailed, type: "error" }),
        });

    return (
        <div className="flex items-center justify-between gap-3">
            <div>
                <p className="text-sm font-medium">Aceitar convidados</p>
                <p className="text-xs text-muted-foreground">
                    Desligar nega os pedidos e remove quem já está no espaço.
                </p>
            </div>
            <Switch
                checked={space?.guestAccess === SPACE_GUEST_ACCESS.ALLOWED}
                disabled={!space || setAccess.isPending}
                onCheckedChange={change}
            />
        </div>
    );
};
