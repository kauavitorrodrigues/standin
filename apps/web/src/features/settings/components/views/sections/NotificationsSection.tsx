import { useNotificationSettings } from "@/features/notifications/hooks/useNotificationSettings";
import { getNotificationsDescription } from "../../../utils/getNotificationsDescription";
import { NotificationSettingsSelect } from "../../instances/NotificationSettingsSelect";
import { NotificationsSwitch } from "../../instances/NotificationsSwitch";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

export const NotificationsSection = () => {
    const { permission } = useNotificationSettings();

    return (
        <>
            <SettingsGroup label="Navegador">
                <SettingsRow
                    title="Notificações do navegador"
                    description={getNotificationsDescription(permission)}
                >
                    <NotificationsSwitch />
                </SettingsRow>
            </SettingsGroup>
            <SettingsGroup label="Chat">
                <SettingsRow
                    title="Notificar sobre"
                    description="Escolha de quais mensagens você quer ser avisado com a aba em segundo plano"
                >
                    <NotificationSettingsSelect
                        field="chatNotify"
                        ariaLabel="Notificar sobre mensagens"
                        options={[
                            { value: "all", label: "Todas as mensagens" },
                            { value: "direct", label: "Mensagens diretas" },
                            { value: "none", label: "Nada" },
                        ]}
                    />
                </SettingsRow>
                <SettingsRow
                    title="Tocar som para"
                    description="Escolha quais mensagens devem tocar um som com a aba em segundo plano"
                >
                    <NotificationSettingsSelect
                        field="chatSound"
                        ariaLabel="Tocar som para mensagens"
                        options={[
                            { value: "all", label: "Todas as mensagens" },
                            { value: "direct", label: "Mensagens diretas" },
                            { value: "never", label: "Nunca" },
                        ]}
                    />
                </SettingsRow>
            </SettingsGroup>
        </>
    );
};
