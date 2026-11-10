import type { SpotifyOwnerStatus } from "@standin/contracts";
import type { AppStatus } from "@/features/integrations/types/app";

/** How the card shows the Spotify app to its owner: set up or not. */
export const getAppStatus = (
    status: SpotifyOwnerStatus | undefined
): AppStatus => {
    if (!status) return { label: "Carregando...", isConnected: false };
    if (status.isConfigured) return { label: "Configurado", isConnected: true };

    return { label: "Não configurado", isConnected: false };
};
