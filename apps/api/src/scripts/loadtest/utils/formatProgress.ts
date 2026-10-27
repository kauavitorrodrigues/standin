type Progress = {
    elapsedSec: number;
    durationSec: number;
    // What the bots received in the last interval, all bots together.
    messagesPerSec: number;
    bytesPerSec: number;
    rssMb: number | null;
    // CPU of the API in this stretch as a share of one core, null when unknown.
    cpuPercent: number | null;
};

export const formatProgress = ({
    elapsedSec,
    durationSec,
    messagesPerSec,
    bytesPerSec,
    rssMb,
    cpuPercent,
}: Progress): string => {
    const rss = rssMb === null ? "n/a" : `${rssMb.toFixed(0)} MB`;
    const cpu = cpuPercent === null ? "n/a" : `${cpuPercent.toFixed(1)}%`;
    return [
        `${Math.round(elapsedSec)}s/${durationSec}s`,
        `${messagesPerSec.toFixed(0)} msg/s`,
        `${(bytesPerSec / 1024).toFixed(1)} KB/s`,
        `rss ${rss}`,
        `cpu ${cpu}`,
    ].join("  ");
};
