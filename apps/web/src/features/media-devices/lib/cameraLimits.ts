import {
    CAMERA_LIMIT_RETURN_MARGIN,
    FULL_HD_MAX_PEOPLE,
    HD_MAX_PEOPLE,
    WEAK_DEVICE_MAX_CORES,
    WEAK_DEVICE_MAX_MEMORY_GB,
} from "@/features/media-devices/consts/cameraLimits";
import {
    CAMERA_RESOLUTION_IDS,
    type CameraResolution,
} from "@/features/media-devices/consts/videoSettings";

const rankOf = (resolution: CameraResolution): number =>
    CAMERA_RESOLUTION_IDS.indexOf(resolution);

/** The smaller of the given resolutions. */
export const smallestResolution = (
    ...resolutions: CameraResolution[]
): CameraResolution =>
    resolutions.reduce((smallest, next) =>
        rankOf(next) < rankOf(smallest) ? next : smallest
    );

/**
 * The biggest resolution the number of people in the space allows. The limit
 * the camera is held at is kept until the count falls a little below it.
 *
 * @param held The limit applied now, to decide whether to stay on it.
 */
export const roomLimitFor = (
    onlineCount: number,
    held: CameraResolution
): CameraResolution => {
    const fits = (max: number, isHeld: boolean): boolean =>
        onlineCount <= (isHeld ? max : max - CAMERA_LIMIT_RETURN_MARGIN);

    if (fits(FULL_HD_MAX_PEOPLE, held === "1080p")) return "1080p";
    if (fits(HD_MAX_PEOPLE, held === "1080p" || held === "720p"))
        return "720p";
    return "480p";
};

type DeviceHints = { cores?: number; memoryGb?: number };

/**
 * The biggest resolution this machine is trusted with, from what the browser
 * reports. A missing value counts as capable, since the browser may hide it.
 */
export const deviceLimitFor = ({
    cores,
    memoryGb,
}: DeviceHints): CameraResolution => {
    const isWeakCpu = cores !== undefined && cores <= WEAK_DEVICE_MAX_CORES;
    const isWeakMemory =
        memoryGb !== undefined && memoryGb <= WEAK_DEVICE_MAX_MEMORY_GB;
    return isWeakCpu || isWeakMemory ? "720p" : "1080p";
};

/** Reads the hints of this machine from the browser. */
export const readDeviceLimit = (): CameraResolution =>
    deviceLimitFor({
        cores: navigator.hardwareConcurrency,
        memoryGb: (navigator as Navigator & { deviceMemory?: number })
            .deviceMemory,
    });
