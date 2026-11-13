import { SpaceAmbientRangeSelect } from "../../instances/SpaceAmbientRangeSelect";
import { SpaceProximitySelect } from "../../instances/SpaceProximitySelect";
import { SpaceSettingSwitch } from "../../instances/SpaceSettingSwitch";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

export const ConversationsSection = () => (
    <>
        <SettingsGroup label="Alcance">
            <SettingsRow
                title="Alcance da voz e do vídeo"
                description="Até onde as pessoas se ouvem e se veem no mapa. Vale para todo mundo neste espaço."
            >
                <SpaceProximitySelect />
            </SettingsRow>
            <SettingsRow
                title="Alcance das conversas por perto"
                description="Até onde as pessoas ouvem, mais baixo, as conversas além do alcance da voz. Vale para todo mundo neste espaço."
            >
                <SpaceAmbientRangeSelect />
            </SettingsRow>
        </SettingsGroup>
        <SettingsGroup label="Mensagens">
            <SettingsRow
                title="Mensagem para quem está perto"
                description="Permite enviar mensagens às pessoas próximas no mapa."
            >
                <SpaceSettingSwitch
                    field="enableSendNearbyInMapView"
                    ariaLabel="Mensagem para quem está perto"
                />
            </SettingsRow>
        </SettingsGroup>
    </>
);
