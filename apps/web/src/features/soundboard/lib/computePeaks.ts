const loudest = (samples: Float32Array): number => {
    let peak = 0;
    for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
    return peak;
};

/** The loudest sample of each bucket across channels, from 0 to 1, for the waveform. */
export const computePeaks = (
    channels: Float32Array[],
    buckets: number
): Float32Array => {
    const peaks = new Float32Array(buckets);
    const total = channels[0]?.length ?? 0;
    if (total === 0 || buckets <= 0) return peaks;

    const size = total / buckets;
    channels.forEach((channel) => {
        peaks.forEach((current, bucket) => {
            const from = Math.floor(bucket * size);
            const to = Math.max(from + 1, Math.floor((bucket + 1) * size));
            peaks[bucket] = Math.max(
                current,
                loudest(channel.subarray(from, to))
            );
        });
    });
    return peaks;
};
