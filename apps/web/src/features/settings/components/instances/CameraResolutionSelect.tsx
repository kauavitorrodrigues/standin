import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CAMERA_RESOLUTION_IDS,
    type CameraResolution,
} from "@/features/media-devices/consts/videoSettings";
import { useCameraResolutionPreference } from "@/features/media-devices/hooks/useCameraResolutionPreference";
import { cameraResolutionPreference } from "@/features/media-devices/lib/videoSettingsPreferences";
import {
    readDeviceLimit,
    smallestResolution,
} from "@/features/media-devices/lib/cameraLimits";

export const CameraResolutionSelect = () => {
    const resolution = useCameraResolutionPreference();
    // A weak machine is not offered the biggest resolution.
    const offered = CAMERA_RESOLUTION_IDS.filter(
        (id) => smallestResolution(id, readDeviceLimit()) === id
    );

    return (
        <Select
            value={resolution}
            onValueChange={(next) => {
                if (next) {
                    cameraResolutionPreference.set(next as CameraResolution);
                }
            }}
        >
            <SelectTrigger
                aria-label="Resolução da câmera"
                className="w-32"
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {offered.map((id) => (
                    <SelectItem key={id} value={id}>
                        {id}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
