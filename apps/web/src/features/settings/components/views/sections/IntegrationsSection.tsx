import { SpotifyAccountPanel } from "@/features/integrations/providers/spotify/components/instances/AccountPanel";
import { useSettingsSpace } from "../../../hooks/useSettingsSpace";
import { SettingsGroup } from "../../layout/SettingsGroup";

// The accounts of the person, one per service. Every member connects their own
// here; the owner sets up the app of the organization in Apps.
export const IntegrationsSection = () => {
    const { organizationId } = useSettingsSpace();

    return (
        <SettingsGroup label="Spotify">
            <SpotifyAccountPanel organizationId={organizationId} />
        </SettingsGroup>
    );
};
