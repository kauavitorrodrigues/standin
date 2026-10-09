import { Switch } from "@/components/ui/switch";
import { useNotificationSettings } from "@/features/notifications/hooks/useNotificationSettings";

export const NotificationsSwitch = () => {
    const { isEnabled, canChange, setEnabled } = useNotificationSettings();

    return (
        <Switch
            aria-label="Notificações do navegador"
            checked={isEnabled}
            disabled={!canChange}
            onCheckedChange={setEnabled}
        />
    );
};
