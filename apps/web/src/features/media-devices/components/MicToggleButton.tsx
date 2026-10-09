import { MicIcon } from "lucide-react";
import { DeviceToggleButton } from "@/features/media-devices/components/DeviceToggleButton";
import {
    LOCAL_AUDIO_STREAM_ERROR_LABEL,
    type LocalAudioStreamError,
} from "@/features/media-devices/consts/audioError";
import { MIC_SHORTCUT } from "@/features/media-devices/consts/shortcuts";
import { useMediaDeviceControl } from "@/features/media-devices/hooks/useMediaDeviceControl";

type Props = { error: LocalAudioStreamError | null };

export const MicToggleButton = ({ error }: Props) => {
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
            shortcut={MIC_SHORTCUT}
            errorLabel={error && LOCAL_AUDIO_STREAM_ERROR_LABEL[error]}
            pressed={enabled}
            pending={pending}
            onPressedChange={toggle}
            activeIcon={<MicIcon />}
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
