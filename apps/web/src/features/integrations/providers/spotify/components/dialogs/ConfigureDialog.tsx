import { AppActionDialog } from "@/features/integrations/components/dialogs/AppActionDialog";
import { SpotifySetupPanel } from "../instances/SetupPanel";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
};

// The Spotify app of the organization, for its owner, in steps.
export const SpotifyConfigureDialog = ({
    open,
    onOpenChange,
    organizationId,
}: Props) => (
    <AppActionDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Configurar o app do Spotify"
        description="O app que a organização usa para conectar as contas do Spotify."
    >
        <SpotifySetupPanel organizationId={organizationId} />
    </AppActionDialog>
);
