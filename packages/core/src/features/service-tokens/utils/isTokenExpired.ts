export const isTokenExpired = (expiresAt: Date | null, now: Date): boolean =>
    expiresAt !== null && expiresAt.getTime() <= now.getTime();
