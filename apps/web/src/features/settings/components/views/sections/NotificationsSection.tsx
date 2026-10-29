import { Button } from "@/components/ui/button";
import { playNotificationSoundNow } from "@/features/notifications/lib/playNotificationSound";
import { useNotificationSettings } from "@/features/notifications/hooks/useNotificationSettings";
import { getNotificationsDescription } from "../../../utils/getNotificationsDescription";
import { NotificationSettingsSelect } from "../../instances/NotificationSettingsSelect";
import { NotificationVolumeSlider } from "../../instances/NotificationVolumeSlider";
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
                <SettingsRow
                    title="Volume dos avisos"
                    description="Volume dos sons de aviso, no alto-falante escolhido em Áudio"
                >
                    <NotificationVolumeSlider />
                </SettingsRow>
                <SettingsRow
                    title="Testar aviso"
                    description="Toca o som de aviso como ele soa para uma nova mensagem"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={playNotificationSoundNow}
                    >
                        Tocar aviso
                    </Button>
                </SettingsRow>
            </SettingsGroup>
        </>
    );
};
