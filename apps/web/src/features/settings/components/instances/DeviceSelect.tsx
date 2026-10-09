import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { MediaDeviceOption } from "@/features/media-devices/hooks/useMediaDeviceControl";

type Props = {
    ariaLabel: string;
    placeholder: string;
    devices: MediaDeviceOption[];
    selectedDeviceId: string;
    onSelectDevice: (deviceId: string) => void;
    // The device list is only available once the browser allows it, so it
    // loads when the select opens.
    onOpen: () => void;
};

export const DeviceSelect = ({
    ariaLabel,
    placeholder,
    devices,
    selectedDeviceId,
    onSelectDevice,
    onOpen,
}: Props) => (
    <Select
        value={selectedDeviceId || null}
        onValueChange={(deviceId) => {
            if (deviceId) onSelectDevice(deviceId);
        }}
        onOpenChange={(open) => {
            if (open) onOpen();
        }}
    >
        <SelectTrigger aria-label={ariaLabel} className="w-56">
            <SelectValue placeholder={placeholder}>
                {(deviceId: string | null) =>
                    devices.find((device) => device.deviceId === deviceId)
                        ?.label ?? placeholder
                }
            </SelectValue>
        </SelectTrigger>
        <SelectContent>
            {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
