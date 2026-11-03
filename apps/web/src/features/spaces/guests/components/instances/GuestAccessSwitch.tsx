import { SPACE_GUEST_ACCESS } from "@standin/contracts";
import { DoorOpenIcon } from "lucide-react";
import { SettingSwitchCard } from "@/features/global-settings/components/views/SettingSwitchCard";
import { toast } from "@/components/ui/toast";
import { GuestMessages } from "../../consts/messages";
import { GuestMutations } from "../../mutations";
import { GuestQueries } from "../../queries";

const SWITCH_ID = "guest-access-switch";

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
        <SettingSwitchCard
            id={SWITCH_ID}
            icon={DoorOpenIcon}
            title="Aceitar convidados"
            description="Desligar nega os pedidos e remove quem já está no espaço."
            checked={space?.guestAccess === SPACE_GUEST_ACCESS.ALLOWED}
            disabled={!space || setAccess.isPending}
            onChange={change}
        />
    );
};
