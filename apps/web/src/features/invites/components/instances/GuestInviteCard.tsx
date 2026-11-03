import { toast } from "@/components/ui/toast";
import { GuestAccessSwitch } from "@/features/spaces/guests/components/instances/GuestAccessSwitch";
import { buildInviteLink } from "@/features/spaces/guests/utils/buildInviteLink";
import { InviteMessages } from "../../consts/messages";
import { InviteMutations } from "../../mutations";
import { InviteQueries } from "../../queries";
import { GuestValidityField } from "../fields/GuestValidityField";
import { LinkField } from "../fields/LinkField";
import { InviteSection } from "../layout/InviteSection";
import { LinkLoadError } from "../views/LinkLoadError";

const LINK_HINT =
    "Quem abrir o link pede para entrar e um anfitrião precisa admitir.";

// The guests tab: the fixed link of the space, how long a guest keeps the
// access once admitted, and the switch that turns guests off.
export const GuestInviteCard = ({ spaceId }: { spaceId: string }) => {
    const link = InviteQueries.useSpaceFixedLink(spaceId, true);
    const reset = InviteMutations.resetSpaceLink(spaceId);
    const setValidity = InviteMutations.setGuestValidity(spaceId);

    const resetLink = () =>
        reset.mutate(undefined, {
            onSuccess: () =>
                toast.add({ title: InviteMessages.reset, type: "success" }),
            onError: () =>
                toast.add({ title: InviteMessages.resetFailed, type: "error" }),
        });

    const changeValidity = (hours: number | null) =>
        setValidity.mutate(hours, {
            onError: () =>
                toast.add({
                    title: InviteMessages.validityFailed,
                    type: "error",
                }),
        });

    const url = link.data
        ? buildInviteLink(window.location.origin, link.data.token)
        : null;

    return (
        <InviteSection
            title="Convidar convidados com este link"
            hint={LINK_HINT}
        >
            <LinkField
                url={url}
                isResetting={reset.isPending}
                onReset={resetLink}
            />
            {link.isError && <LinkLoadError />}
            <GuestValidityField
                hours={link.data?.guestValidityHours}
                onChange={changeValidity}
            />
            <GuestAccessSwitch spaceId={spaceId} />
        </InviteSection>
    );
};
