import { VideoIcon, VideoOffIcon } from "lucide-react";
import { DeviceToggleButton } from "@/features/media-devices/components/DeviceToggleButton";
import { useMediaDeviceControl } from "@/features/media-devices/hooks/useMediaDeviceControl";

export const CameraToggleButton = () => {
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
            pressed={enabled}
            pending={pending}
            onPressedChange={toggle}
            activeIcon={<VideoIcon />}
            inactiveIcon={<VideoOffIcon />}
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
