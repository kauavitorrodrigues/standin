import { useState } from "react";
import { SpotifyLogoIcon } from "@/components/logos";
import { AppCard } from "@/features/integrations/components/views/card/AppCard";
import { SpotifyQueries } from "../../queries";
import { getAppStatus } from "../../utils/getAppStatus";
import { SpotifyConfigureDialog } from "../dialogs/ConfigureDialog";
import { SpotifyDetailsDialog } from "../dialogs/DetailsDialog";

type Props = {
    organizationId: string;
};

// The card of Spotify in the apps of the organization, which only its owner
// sees. It shows whether the app is set up and opens the details in a dialog;
// setting up opens its own dialog over it. Members connect their account in
// their integrations.
export const SpotifyAppCard = ({ organizationId }: Props) => {
    const { data: ownerStatus } = SpotifyQueries.useOwnerStatus(
        organizationId,
        true
    );
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isConfigureOpen, setIsConfigureOpen] = useState(false);
    const status = getAppStatus(ownerStatus);

    return (
        <>
            <AppCard
                icon={<SpotifyLogoIcon />}
                name="Spotify"
                provider="Spotify"
                status={status}
                description="Configure o app do Spotify desta organização. Cada pessoa conecta a própria conta em Integrações. O Spotify deixa até 5 pessoas por app."
                tags={["Música"]}
                onOpen={() => setIsDetailsOpen(true)}
            />
            <SpotifyDetailsDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                status={status}
                onManageApp={() => setIsConfigureOpen(true)}
            />
            <SpotifyConfigureDialog
                open={isConfigureOpen}
                onOpenChange={setIsConfigureOpen}
                organizationId={organizationId}
            />
        </>
    );
};
