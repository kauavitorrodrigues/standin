import { PerformanceSettingsSelect } from "../../instances/PerformanceSettingsSelect";
import { ReduceMotionSwitch } from "../../instances/ReduceMotionSwitch";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

export const PerformanceSection = () => (
    <>
        <SettingsGroup label="Jogo">
            <SettingsRow
                title="Limite de quadros"
                description="Limitar os quadros por segundo poupa processador e bateria, principalmente em telas de 120 Hz ou mais"
            >
                <PerformanceSettingsSelect
                    field="fpsLimit"
                    ariaLabel="Limite de quadros do jogo"
                    options={[
                        { value: "auto", label: "Automático" },
                        { value: "60", label: "60 fps" },
                        { value: "30", label: "30 fps" },
                    ]}
                />
            </SettingsRow>
        </SettingsGroup>
        <SettingsGroup label="Interface">
            <SettingsRow
                title="Reduzir animações"
                description="Desliga as transições e os movimentos da interface"
            >
                <ReduceMotionSwitch />
            </SettingsRow>
        </SettingsGroup>
    </>
);
