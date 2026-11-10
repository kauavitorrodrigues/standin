import axios from "axios";
import { SpotifyMessages } from "../consts/messages";
import { CREDENTIALS_INVALID_STATUS } from "../consts/http";

/** The message for a failed save: Spotify refusing the pair is told apart. */
export const getSaveErrorMessage = (error: unknown): string => {
    if (!axios.isAxiosError(error)) return SpotifyMessages.saveFailed;
    if (error.response?.status !== CREDENTIALS_INVALID_STATUS) {
        return SpotifyMessages.saveFailed;
    }

    return SpotifyMessages.credentialsInvalid;
};
