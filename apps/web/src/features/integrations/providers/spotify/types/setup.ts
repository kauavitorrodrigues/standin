import type { SPOTIFY_SETUP_STEPS } from "../consts/setupSteps";

export type SpotifySetupStepValue =
    (typeof SPOTIFY_SETUP_STEPS)[number]["value"];
