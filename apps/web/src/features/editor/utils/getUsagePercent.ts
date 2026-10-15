// The share of the limit that is used, from 0 to 100. A map without a limit
// shows an empty meter.
export const getUsagePercent = (used: number, max: number): number => {
    if (max <= 0) return 0;
    return Math.min(100, Math.round((used / max) * 100));
};
