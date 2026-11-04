import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { SpaceSettingsMessages } from "@/features/spaces/settings/consts/messages";
import { SpaceSettingsMutations } from "@/features/spaces/settings/mutations";
import { SpaceSettingsQueries } from "@/features/spaces/settings/queries";
import { useSettingsSpace } from "../../hooks/useSettingsSpace";
import type { BooleanSpaceSetting } from "../../types";

type Props = {
    field: BooleanSpaceSetting;
    ariaLabel: string;
};

// One switch of the space, saved as soon as it changes and applied to everybody.
export const SpaceSettingSwitch = ({ field, ariaLabel }: Props) => {
    const { spaceId } = useSettingsSpace();
    const { settings } = SpaceSettingsQueries.useSpaceSettings(spaceId, true);
    const update = SpaceSettingsMutations.update(spaceId);

    const change = (value: boolean) =>
        update.mutate(
            { [field]: value },
            {
                onError: () =>
                    toast.add({
                        title: SpaceSettingsMessages.saveFailed,
                        type: "error",
                    }),
            }
        );

    return (
        <Switch
            aria-label={ariaLabel}
            checked={settings?.[field] ?? false}
            disabled={!settings || update.isPending}
            onCheckedChange={change}
        />
    );
};
