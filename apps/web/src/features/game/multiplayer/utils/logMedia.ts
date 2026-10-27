/**
 * Writes a step of the media session to the console while developing, so a
 * session that stops half way shows where. Silent in production builds.
 */
export const logMedia = (step: string, detail?: unknown): void => {
    if (!import.meta.env.DEV) return;
    console.debug(`[multiplayer] media: ${step}`, detail ?? "");
};
