import { VideoIcon } from "lucide-react";
import { DeviceToggleButton } from "@/features/media-devices/components/DeviceToggleButton";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { LOCAL_CAMERA_ERROR_LABEL } from "@/features/media-devices/consts/videoError";
import { CAMERA_SHORTCUT } from "@/features/media-devices/consts/shortcuts";
import { useMediaDeviceControl } from "@/features/media-devices/hooks/useMediaDeviceControl";

type Props = { error: LocalAudioStreamError | null };

export const CameraToggleButton = ({ error }: Props) => {
    const {
        enabled,
        pending,
        toggle,
        devices,
        devicesLoading,
        ensureDevicesLoaded,
        selectedDeviceId,
        selectDevice,
    } = useMediaDeviceControl("camera");

    return (
        <DeviceToggleButton
            shortcut={CAMERA_SHORTCUT}
            errorLabel={error && LOCAL_CAMERA_ERROR_LABEL[error]}
            pressed={enabled}
            pending={pending}
            onPressedChange={toggle}
            activeIcon={<VideoIcon />}
            activeLabel="Desativar câmera"
            inactiveLabel="Ativar câmera"
            menuLabel="Selecionar câmera"
            devices={devices}
            devicesLoading={devicesLoading}
            onOpenDeviceMenu={ensureDevicesLoaded}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={selectDevice}
        />
    );
};
