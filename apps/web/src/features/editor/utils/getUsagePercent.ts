// The share of the limit that is used, from 0 to 100. A map without a limit
// shows an empty meter, and any use at all shows at least 1% so a few objects
// do not read as nothing.
export const getUsagePercent = (used: number, max: number): number => {
    if (max <= 0 || used <= 0) return 0;
    return Math.min(100, Math.max(1, Math.round((used / max) * 100)));
};
