import { SpaceSettingSwitch } from "../../instances/SpaceSettingSwitch";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

export const SecuritySection = () => (
    <SettingsGroup label="Convites">
        <SettingsRow
            title="Membros podem convidar"
            description="Qualquer membro da organização pode copiar o link de convidados. Só vale com convidados aceitos."
        >
            <SpaceSettingSwitch
                field="membersCanInvite"
                ariaLabel="Membros podem convidar"
            />
        </SettingsRow>
    </SettingsGroup>
);
