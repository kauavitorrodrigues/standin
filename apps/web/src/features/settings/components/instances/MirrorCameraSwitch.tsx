import { Switch } from "@/components/ui/switch";
import { useMirrorSelfCameraPreference } from "@/features/media-devices/hooks/useMirrorSelfCameraPreference";
import { mirrorSelfCameraPreference } from "@/features/media-devices/lib/videoSettingsPreferences";

export const MirrorCameraSwitch = () => {
    const mirrored = useMirrorSelfCameraPreference();

    return (
        <Switch
            aria-label="Espelhar minha câmera"
            checked={mirrored}
            onCheckedChange={(checked) =>
                mirrorSelfCameraPreference.set(checked)
            }
        />
    );
};
