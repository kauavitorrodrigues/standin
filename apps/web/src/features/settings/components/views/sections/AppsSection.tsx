import { AppGrid } from "@/features/integrations/components/views/card/AppGrid";
import { SpotifyAppCard } from "@/features/integrations/providers/spotify/components/instances/Card";
import { useSettingsSpace } from "../../../hooks/useSettingsSpace";

// The apps of the organization, for its owner: they set each one up. The
// members connect their own account in Integrations.
export const AppsSection = () => {
    const { organizationId } = useSettingsSpace();

    return (
        <AppGrid>
            <SpotifyAppCard organizationId={organizationId} />
        </AppGrid>
    );
};
