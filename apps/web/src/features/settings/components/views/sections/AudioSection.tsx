import { useMediaDeviceControl } from "@/features/media-devices/hooks/useMediaDeviceControl";
import { AudioProcessingSwitch } from "../../instances/AudioProcessingSwitch";
import { DeviceSelect } from "../../instances/DeviceSelect";
import { MicPreview } from "../../instances/MicPreview";
import { OutputVolumeSlider } from "../../instances/OutputVolumeSlider";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

export const AudioSection = () => {
    const {
        devices,
        selectedDeviceId,
        selectDevice,
        ensureDevicesLoaded,
        outputDevices,
        selectedOutputDeviceId,
        selectOutputDevice,
    } = useMediaDeviceControl("microphone");

    return (
        <>
            <SettingsGroup label="Dispositivos">
                <SettingsRow
                    title="Microfone"
                    description="Dispositivo usado para capturar a sua voz"
                >
                    <DeviceSelect
                        ariaLabel="Selecionar microfone"
                        placeholder="Padrão do sistema"
                        devices={devices}
                        selectedDeviceId={selectedDeviceId}
                        onSelectDevice={selectDevice}
                        onOpen={ensureDevicesLoaded}
                    />
                </SettingsRow>
                <SettingsRow
                    title="Saída de áudio"
                    description="Dispositivo onde você escuta as outras pessoas"
                >
                    <DeviceSelect
                        ariaLabel="Selecionar saída de áudio"
                        placeholder="Padrão do sistema"
                        devices={outputDevices}
                        selectedDeviceId={selectedOutputDeviceId}
                        onSelectDevice={selectOutputDevice}
                        onOpen={ensureDevicesLoaded}
                    />
                </SettingsRow>
            </SettingsGroup>
            <SettingsGroup label="Volume">
                <SettingsRow
                    title="Volume das outras pessoas"
                    description="Ajusta o volume geral de quem está por perto"
                >
                    <OutputVolumeSlider />
                </SettingsRow>
            </SettingsGroup>
            <SettingsGroup label="Processamento de voz">
                <SettingsRow
                    title="Redução de ruído"
                    description="Diminui ruídos de fundo, como teclado e ventilador"
                >
                    <AudioProcessingSwitch
                        processingKey="noiseSuppression"
                        label="Redução de ruído"
                    />
                </SettingsRow>
                <SettingsRow
                    title="Cancelamento de eco"
                    description="Evita que o som dos alto-falantes volte pelo microfone"
                >
                    <AudioProcessingSwitch
                        processingKey="echoCancellation"
                        label="Cancelamento de eco"
                    />
                </SettingsRow>
                <SettingsRow
                    title="Ajuste automático de ganho"
                    description="Mantém o volume da sua voz estável"
                >
                    <AudioProcessingSwitch
                        processingKey="autoGainControl"
                        label="Ajuste automático de ganho"
                    />
                </SettingsRow>
            </SettingsGroup>
            <SettingsGroup label="Teste">
                <MicPreview />
            </SettingsGroup>
        </>
    );
};
