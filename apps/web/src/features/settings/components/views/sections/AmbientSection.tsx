import { AmbientSettingSwitch } from "../../instances/AmbientSettingSwitch";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

export const AmbientSection = () => (
    <SettingsGroup label="Conversas por perto">
        <SettingsRow
            title="Ouvir automaticamente"
            description="Toca, mais baixo, as conversas de quem está logo além do alcance da voz. Desligado, você só vê que há uma conversa."
        >
            <AmbientSettingSwitch
                field="listenAutomatically"
                ariaLabel="Ouvir automaticamente as conversas por perto"
            />
        </SettingsRow>
        <SettingsRow
            title="Baixar o volume de fundo"
            description="Deixa essas conversas ainda mais baixas."
        >
            <AmbientSettingSwitch
                field="lowerBackgroundVolume"
                ariaLabel="Baixar o volume das conversas por perto"
            />
        </SettingsRow>
    </SettingsGroup>
);
