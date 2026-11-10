import { toast } from "@/components/ui/toast";
import { SpotifyMessages } from "../../consts/messages";
import { SpotifyLoadErrorView } from "../views/app/LoadErrorView";
import { startSpotifyConnect } from "../../lib/startConnect";
import { SpotifyMutations } from "../../mutations";
import { SpotifyQueries } from "../../queries";
import { SpotifyAccountView } from "../views/account/AccountView";

type Props = {
    organizationId: string;
};

// The account of the person in this organization.
export const SpotifyAccountPanel = ({ organizationId }: Props) => {
    const { data: status, isError } =
        SpotifyQueries.useMemberStatus(organizationId);
    const disconnect = SpotifyMutations.disconnect(organizationId);

    if (isError) return <SpotifyLoadErrorView />;
    if (!status) return null;

    const handleConnect = () => startSpotifyConnect(organizationId);

    const handleDisconnect = () =>
        disconnect.mutate(undefined, {
            onError: () =>
                toast.add({
                    title: SpotifyMessages.disconnectFailed,
                    type: "error",
                }),
        });

    return (
        <SpotifyAccountView
            status={status}
            isBusy={disconnect.isPending}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
        />
    );
};
