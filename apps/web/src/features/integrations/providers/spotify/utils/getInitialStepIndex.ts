import { SPOTIFY_SETUP_STEPS } from "../consts/setupSteps";

/** A saved app starts on the last step (the summary); a new one on the first. */
export const getInitialStepIndex = (isConfigured: boolean): number => {
    if (isConfigured) return SPOTIFY_SETUP_STEPS.length - 1;

    return 0;
};
