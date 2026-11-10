import {
    SPOTIFY_CONNECT_RESULTS,
    type SpotifyConnectResult,
} from "@standin/contracts";
import { RESULT_BY_ERROR } from "../consts";

/** The fixed code the web page shows for an error of the connection. */
export const resolveSpotifyConnectResult = (
    error: unknown
): SpotifyConnectResult => {
    const match = RESULT_BY_ERROR.find(
        ([ErrorClass]) => error instanceof ErrorClass
    );

    return match?.[1] ?? SPOTIFY_CONNECT_RESULTS.FAILED;
};
