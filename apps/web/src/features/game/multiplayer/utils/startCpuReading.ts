import { CpuLimitationPoller } from "../lib/CpuLimitationPoller";
import type { SfuSupervisor } from "../lib/SfuSupervisor";
import { getWebrtcCpuSignal } from "@/features/settings/performance/lib/degradation/WebrtcCpuSignal";
import { performanceOverrideStore } from "@/features/settings/performance/lib/performanceOverride";

/**
 * Connects the media session to the degradation of the machine, in both
 * directions. The CPU limitation read from the video senders feeds the shared
 * degradation signal, and when the machine is degraded the server is asked for
 * the low layer and fewer streams.
 *
 * @returns A function that disconnects both.
 */
export const startCpuReading = (supervisor: SfuSupervisor): (() => void) => {
    const poller = new CpuLimitationPoller({
        getVideoSenders: () => supervisor.getVideoSenders(),
        onSample: (sample) =>
            getWebrtcCpuSignal().handleQualityLimitation(sample),
    });
    poller.start();

    const askForLowQuality = () =>
        supervisor.setLowQuality(performanceOverrideStore.get().lowCameraBitrate);
    askForLowQuality();
    const stopListening = performanceOverrideStore.subscribe(askForLowQuality);

    return () => {
        poller.stop();
        stopListening();
    };
};
