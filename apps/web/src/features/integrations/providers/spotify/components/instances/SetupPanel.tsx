import { SpotifyQueries } from "../../queries";
import { SpotifyLoadErrorView } from "../views/app/LoadErrorView";
import { SpotifySetupSteps } from "./SetupSteps";

type Props = {
    organizationId: string;
};

// Loads the Spotify app of the organization for its owner and hands it to the
// steps, so they start on the right one.
export const SpotifySetupPanel = ({ organizationId }: Props) => {
    const { data: status, isError } = SpotifyQueries.useOwnerStatus(
        organizationId,
        true
    );

    if (isError) return <SpotifyLoadErrorView />;
    if (!status) return null;

    return (
        <SpotifySetupSteps organizationId={organizationId} status={status} />
    );
};
