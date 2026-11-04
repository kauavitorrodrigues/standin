import { toast } from "@/components/ui/toast";
import { SpaceSettingsMessages } from "@/features/spaces/settings/consts/messages";
import { SpaceSettingsMutations } from "@/features/spaces/settings/mutations";
import { SpaceSettingsQueries } from "@/features/spaces/settings/queries";
import { useSettingsSpace } from "../../hooks/useSettingsSpace";
import { SettingSelect } from "./SettingSelect";

const OPTIONS = [
    { value: "Short", label: "Curto (cerca de 5 passos)" },
    { value: "Long", label: "Longo (cerca de 12 passos)" },
] as const;

// How far people hear and see each other in the space, saved as soon as it
// changes.
export const SpaceProximitySelect = () => {
    const { spaceId } = useSettingsSpace();
    const { settings } = SpaceSettingsQueries.useSpaceSettings(spaceId, true);
    const update = SpaceSettingsMutations.update(spaceId);

    if (!settings) return null;

    return (
        <SettingSelect
            ariaLabel="Alcance da voz e do vídeo"
            options={[...OPTIONS]}
            value={settings.proximityPreset}
            onValueChange={(proximityPreset) =>
                update.mutate(
                    { proximityPreset },
                    {
                        onError: () =>
                            toast.add({
                                title: SpaceSettingsMessages.saveFailed,
                                type: "error",
                            }),
                    }
                )
            }
        />
    );
};
