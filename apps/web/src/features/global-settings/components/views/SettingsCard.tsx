import { Building2Icon, LayoutGridIcon, UserPlusIcon } from "lucide-react";
import type { GlobalSettingKey } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import {
    GLOBAL_SETTING_LABELS,
    GLOBAL_SETTINGS_PAGE_TEXT,
} from "../../consts/messages";
import { useUpdateGlobalSettings } from "../../mutations/useUpdateGlobalSettings";
import { useAdminGlobalSettings } from "../../queries/useAdminGlobalSettings";
import { SettingSwitchCard } from "./SettingSwitchCard";

const SETTING_ICONS = {
    allowSignup: UserPlusIcon,
    allowOrganizationCreation: Building2Icon,
    allowSpaceCreation: LayoutGridIcon,
} as const;

const SETTING_ORDER = Object.keys(SETTING_ICONS) as GlobalSettingKey[];

// Each switch is its own card, in a column centered on the page.
export const SettingsCard = () => {
    const { data: settings, isError } = useAdminGlobalSettings();
    const update = useUpdateGlobalSettings();

    if (isError) {
        return (
            <p className="text-sm text-destructive">
                {GLOBAL_SETTINGS_PAGE_TEXT.LOAD_FAILED}
            </p>
        );
    }

    return (
        <div className="m-auto flex w-full max-w-xl flex-col gap-3">
            {SETTING_ORDER.map((key) => (
                <SettingSwitchCard
                    key={key}
                    id={key}
                    icon={SETTING_ICONS[key]}
                    title={GLOBAL_SETTING_LABELS[key].title}
                    description={GLOBAL_SETTING_LABELS[key].description}
                    checked={settings?.[key] ?? true}
                    disabled={!settings || update.isPending}
                    onChange={(checked) =>
                        update.mutate(
                            { [key]: checked },
                            {
                                onError: () =>
                                    toast.add({
                                        title: GLOBAL_SETTINGS_PAGE_TEXT.SAVE_FAILED,
                                        type: "error",
                                    }),
                            }
                        )
                    }
                />
            ))}
        </div>
    );
};
