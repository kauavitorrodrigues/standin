import { ScreenShareSettingsSelect } from "../../instances/ScreenShareSettingsSelect";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

export const StreamingSection = () => (
    <>
        <SettingsGroup label="Qualidade">
            <SettingsRow
                title="Resolução máxima"
                description="Telas maiores são reduzidas até esse limite. Valem para o próximo compartilhamento"
            >
                <ScreenShareSettingsSelect
                    field="resolution"
                    ariaLabel="Resolução máxima da tela"
                    options={[
                        { value: "720p", label: "720p" },
                        { value: "1080p", label: "1080p" },
                    ]}
                />
            </SettingsRow>
            <SettingsRow
                title="Taxa de quadros"
                description="Menos quadros por segundo pesam menos na sua máquina"
            >
                <ScreenShareSettingsSelect
                    field="frameRate"
                    ariaLabel="Taxa de quadros da tela"
                    options={[
                        { value: "15", label: "15 fps" },
                        { value: "30", label: "30 fps" },
                    ]}
                />
            </SettingsRow>
            <SettingsRow
                title="Prioridade"
                description="Fluidez mantém o movimento suave. Nitidez mantém o texto legível"
            >
                <ScreenShareSettingsSelect
                    field="contentHint"
                    ariaLabel="Prioridade da transmissão"
                    options={[
                        { value: "motion", label: "Fluidez" },
                        { value: "detail", label: "Nitidez" },
                    ]}
                />
            </SettingsRow>
        </SettingsGroup>
        <SettingsGroup label="Comportamento">
            <SettingsRow
                title="Parar sem ninguém por perto"
                description="Encerra o compartilhamento depois desse tempo sem ninguém para receber"
            >
                <ScreenShareSettingsSelect
                    field="idleGrace"
                    ariaLabel="Tempo para parar o compartilhamento"
                    options={[
                        { value: "30s", label: "30 segundos" },
                        { value: "1m", label: "1 minuto" },
                        { value: "5m", label: "5 minutos" },
                        { value: "never", label: "Nunca" },
                    ]}
                />
            </SettingsRow>
        </SettingsGroup>
    </>
);
