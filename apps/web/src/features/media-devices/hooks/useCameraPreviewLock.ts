import { useSyncExternalStore } from "react";
import { cameraPreviewLock } from "@/features/media-devices/lib/cameraPreviewLock";

export const useCameraPreviewLock = () =>
    useSyncExternalStore(cameraPreviewLock.subscribe, cameraPreviewLock.isHeld);
