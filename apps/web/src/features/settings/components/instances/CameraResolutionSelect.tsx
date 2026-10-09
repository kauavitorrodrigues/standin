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

export const CameraResolutionSelect = () => {
    const resolution = useCameraResolutionPreference();

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
                {CAMERA_RESOLUTION_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                        {id}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
