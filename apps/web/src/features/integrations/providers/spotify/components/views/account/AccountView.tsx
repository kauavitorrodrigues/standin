import type { SpotifyMemberStatus } from "@standin/contracts";
import { SpotifyLogoIcon } from "@/components/logos";
import { Button } from "@/components/ui/button";
import { SettingsRow } from "@/features/settings/components/layout/SettingsRow";
import { getAccountDescription } from "@/features/integrations/providers/spotify/utils/getAccountDescription";

type Props = {
    status: SpotifyMemberStatus;
    isBusy: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
};

// The account of the person: connect it, or refresh and disconnect it. Without
// an app in the organization the button is there but locked, so the person
// sees that connecting exists and why it waits.
export const SpotifyAccountView = ({
    status,
    isBusy,
    onConnect,
    onDisconnect,
}: Props) => (
    <SettingsRow
        title="Conectar o Spotify"
        description={getAccountDescription(status)}
    >
        {status.isConnected ? (
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={onConnect}
                >
                    Atualizar
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={onDisconnect}
                >
                    Desconectar
                </Button>
            </div>
        ) : (
            <Button
                type="button"
                variant="outline"
                disabled={isBusy || !status.isAvailable || status.isFull}
                onClick={onConnect}
            >
                <SpotifyLogoIcon className="size-4" />
                Entrar com o Spotify
            </Button>
        )}
    </SettingsRow>
);
