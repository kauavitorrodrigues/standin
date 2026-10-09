import { useMediaDeviceControl } from "@/features/media-devices/hooks/useMediaDeviceControl";
import { CameraPreview } from "../../instances/CameraPreview";
import { CameraResolutionSelect } from "../../instances/CameraResolutionSelect";
import { DeviceSelect } from "../../instances/DeviceSelect";
import { MirrorCameraSwitch } from "../../instances/MirrorCameraSwitch";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

export const VideoSection = () => {
    const { devices, selectedDeviceId, selectDevice, ensureDevicesLoaded } =
        useMediaDeviceControl("camera");

    return (
        <>
            <SettingsGroup label="Dispositivo">
                <SettingsRow
                    title="Câmera"
                    description="Dispositivo usado para enviar o seu vídeo"
                >
                    <DeviceSelect
                        ariaLabel="Selecionar câmera"
                        placeholder="Padrão do sistema"
                        devices={devices}
                        selectedDeviceId={selectedDeviceId}
                        onSelectDevice={selectDevice}
                        onOpen={ensureDevicesLoaded}
                    />
                </SettingsRow>
            </SettingsGroup>
            <SettingsGroup label="Qualidade">
                <SettingsRow
                    title="Resolução"
                    description="Resoluções maiores usam mais do seu processador. O envio continua limitado para não pesar na conexão"
                >
                    <CameraResolutionSelect />
                </SettingsRow>
            </SettingsGroup>
            <SettingsGroup label="Aparência">
                <SettingsRow
                    title="Espelhar minha câmera"
                    description="Mostra o seu vídeo como num espelho. Só você vê assim"
                >
                    <MirrorCameraSwitch />
                </SettingsRow>
            </SettingsGroup>
            <SettingsGroup label="Pré-visualização">
                <CameraPreview />
            </SettingsGroup>
        </>
    );
};
