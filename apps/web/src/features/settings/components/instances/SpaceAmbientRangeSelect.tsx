import { toast } from "@/components/ui/toast";
import { SpaceSettingsMessages } from "@/features/spaces/settings/consts/messages";
import { SpaceSettingsMutations } from "@/features/spaces/settings/mutations";
import { SpaceSettingsQueries } from "@/features/spaces/settings/queries";
import { useSettingsSpace } from "../../hooks/useSettingsSpace";
import { SettingSelect } from "./SettingSelect";

const OPTIONS = [
    { value: "short", label: "Curto (cerca de 4 passos além)" },
    { value: "long", label: "Longo (cerca de 10 passos além)" },
    { value: "off", label: "Desligado" },
] as const;

// How far past the voice people overhear the conversations nearby in the
// space, saved as soon as it changes.
export const SpaceAmbientRangeSelect = () => {
    const { spaceId } = useSettingsSpace();
    const { settings } = SpaceSettingsQueries.useSpaceSettings(spaceId, true);
    const update = SpaceSettingsMutations.update(spaceId);

    if (!settings) return null;

    return (
        <SettingSelect
            ariaLabel="Alcance das conversas por perto"
            options={[...OPTIONS]}
            value={settings.ambientRange}
            onValueChange={(ambientRange) =>
                update.mutate(
                    { ambientRange },
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
