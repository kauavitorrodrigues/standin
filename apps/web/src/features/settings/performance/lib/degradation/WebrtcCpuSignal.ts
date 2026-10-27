import { BaseDegradationSignal } from "./BaseDegradationSignal";
import { CPU_LIMITATION_NO_EVENTS_TIMEOUT_MS, WebrtcCpuWindow } from "./WebrtcCpuWindow";

// Shape of the synthetic QualityLimitation event.
export type QualityLimitationEvent = {
    reason: string;
    cpuLimitedDuration: number;
};

// Fed by whoever measures the outbound video, so the P2P poller and the
// future SfuClient can drive the same signal through handleQualityLimitation.
export class WebrtcCpuSignal extends BaseDegradationSignal {
    readonly id = "webrtcCpuLimitation";
    readonly isHardwarePerformanceLimited = true;
    private readonly window: WebrtcCpuWindow;
    private silenceTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(window: WebrtcCpuWindow = new WebrtcCpuWindow()) {
        super();
        this.window = window;
    }

    start() {}

    stop() {
        this.clearSilenceTimer();
        this.setSeverity(this.window.reset());
    }

    handleQualityLimitation = (event: QualityLimitationEvent) => {
        this.armSilenceTimer();
        const duration = (event.reason === "cpu" && event.cpuLimitedDuration) || 0;
        this.setSeverity(this.window.record(duration));
    };

    private armSilenceTimer() {
        this.clearSilenceTimer();
        this.silenceTimer = setTimeout(() => {
            this.silenceTimer = null;
            this.setSeverity(this.window.reset());
        }, CPU_LIMITATION_NO_EVENTS_TIMEOUT_MS);
    }

    private clearSilenceTimer() {
        if (this.silenceTimer === null) return;
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
    }
}

let sharedSignal: WebrtcCpuSignal | null = null;

export const getWebrtcCpuSignal = () => {
    sharedSignal ??= new WebrtcCpuSignal();
    return sharedSignal;
};
