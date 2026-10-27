import { SpaceSettingsQueries } from "../../queries";
import { SpaceSettingsForm } from "../forms/SpaceSettingsForm";

type Props = { spaceId: string; onClose: () => void };

// The form starts from the saved values, so it waits for them.
export const SpaceSettingsLoader = ({ spaceId, onClose }: Props) => {
    const { settings } = SpaceSettingsQueries.useSpaceSettings(spaceId, true);

    if (!settings) return null;

    return (
        <SpaceSettingsForm
            key={JSON.stringify(settings)}
            spaceId={spaceId}
            settings={settings}
            onClose={onClose}
        />
    );
};
