export const DegradationSeverity = {
    None: 0,
    Degraded: 1,
} as const;

export type DegradationSeverity = (typeof DegradationSeverity)[keyof typeof DegradationSeverity];
