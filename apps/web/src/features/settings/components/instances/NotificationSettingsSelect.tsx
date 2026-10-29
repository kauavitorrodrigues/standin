import type { NotificationSettings } from "@/features/notifications/consts/notificationSettings";
import { useNotificationSettingsPreference } from "@/features/notifications/hooks/useNotificationSettingsPreference";
import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";
import { SettingSelect } from "./SettingSelect";

type Option<T extends string> = { value: T; label: string };

// The volume has its own slider.
type SelectField = Exclude<keyof NotificationSettings, "volume">;

type Props<K extends SelectField> = {
    field: K;
    ariaLabel: string;
    options: Option<NotificationSettings[K]>[];
};

// One field of the notification settings, saved as soon as it changes.
export const NotificationSettingsSelect = <K extends SelectField>({
    field,
    ariaLabel,
    options,
}: Props<K>) => {
    const settings = useNotificationSettingsPreference();

    return (
        <SettingSelect
            ariaLabel={ariaLabel}
            options={options}
            value={settings[field]}
            onValueChange={(value) =>
                notificationSettingsPreference.set({
                    ...settings,
                    [field]: value,
                })
            }
        />
    );
};
