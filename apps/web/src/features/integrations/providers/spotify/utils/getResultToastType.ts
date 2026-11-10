import { SPOTIFY_CONNECT_RESULTS } from "@standin/contracts";

/** The toast is a success only when the connection worked. */
export const getResultToastType = (result: string): "success" | "error" => {
    if (result === SPOTIFY_CONNECT_RESULTS.CONNECTED) return "success";
    return "error";
};
