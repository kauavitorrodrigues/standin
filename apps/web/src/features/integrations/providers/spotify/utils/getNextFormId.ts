import { SPOTIFY_SAVE_FORM_ID } from "../consts/setupSteps";
import type { SpotifySetupStepValue } from "../types/setup";

/** The form the Next button submits on this step, if the step has one. */
export const getNextFormId = (
    step: SpotifySetupStepValue
): string | undefined => {
    if (step === "credentials") return SPOTIFY_SAVE_FORM_ID;

    return undefined;
};
