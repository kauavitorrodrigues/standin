import { VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOCAL_CAMERA_ERROR_LABEL } from "@/features/media-devices/consts/videoError";
import { useCameraPreview } from "@/features/media-devices/hooks/useCameraPreview";
import { useMirrorSelfCameraPreference } from "@/features/media-devices/hooks/useMirrorSelfCameraPreference";
import { VideoElement } from "@/components/VideoElement";
import { SettingsRow } from "../layout/SettingsRow";

// Takes no space until the test starts: the frame only exists while the
// preview runs.
export const CameraPreview = () => {
    const { stream, error, isPreviewing, start, stop } = useCameraPreview();
    const mirrored = useMirrorSelfCameraPreference();
    const isStarting = isPreviewing && !stream && !error;

    const frame = isPreviewing ? (
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-900 text-sm text-neutral-400">
            {stream ? (
                <VideoElement
                    stream={stream}
                    mirrored={mirrored}
                    className="object-cover"
                />
            ) : (
                <span className="flex items-center gap-2">
                    <VideoIcon className="size-4" />
                    {error ? LOCAL_CAMERA_ERROR_LABEL[error] : "Abrindo a câmera"}
                </span>
            )}
        </div>
    ) : null;

    return (
        <>
            <SettingsRow title="Testar câmera" description="A câmera enviada para as outras pessoas é pausada durante o teste">
                <Button
                    variant="outline"
                    size="sm"
                    isLoading={isStarting}
                    onClick={isPreviewing ? stop : start}
                >
                    {isPreviewing ? "Parar teste" : "Iniciar teste"}
                </Button>
            </SettingsRow>
            {frame}
        </>
    );
};
