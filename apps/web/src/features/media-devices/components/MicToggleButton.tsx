import { MicIcon, MicOffIcon } from "lucide-react";
import { DeviceToggleButton } from "@/features/media-devices/components/DeviceToggleButton";
import { useMediaDeviceControl } from "@/features/media-devices/hooks/useMediaDeviceControl";

export const MicToggleButton = () => {
    const {
        enabled,
        pending,
        toggle,
        devices,
        devicesLoading,
        ensureDevicesLoaded,
        selectedDeviceId,
        selectDevice,
        outputDevices,
        selectedOutputDeviceId,
        selectOutputDevice,
    } = useMediaDeviceControl("microphone");

    return (
        <DeviceToggleButton
            pressed={enabled}
            pending={pending}
            onPressedChange={toggle}
            activeIcon={<MicIcon />}
            inactiveIcon={<MicOffIcon />}
            activeLabel="Silenciar microfone"
            inactiveLabel="Ativar microfone"
            menuLabel="Selecionar microfone"
            devices={devices}
            devicesLoading={devicesLoading}
            onOpenDeviceMenu={ensureDevicesLoaded}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={selectDevice}
            secondarySection={{
                label: "Selecionar saída de som",
                devices: outputDevices,
                selectedDeviceId: selectedOutputDeviceId,
                onSelectDevice: selectOutputDevice,
            }}
        />
    );
};
