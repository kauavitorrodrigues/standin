import { RemoteTokenMissingError } from "../errors/RemoteTokenMissingError";
import { RemoteUrlMissingError } from "../errors/RemoteUrlMissingError";
import type { CliConfigFile, RemoteTarget } from "../types";
import { normalizeBaseUrl } from "../utils/normalizeBaseUrl";
import { requireRemoteTarget } from "./requireRemoteTarget";

// Completes what the flags and the environment gave with the login file,
// never mixing the halves of two different logins.
export const resolveWithSavedLogin = (
    picked: CliConfigFile,
    saved: CliConfigFile | undefined
): RemoteTarget => {
    if (!picked.url && !picked.token) return requireRemoteTarget(saved ?? {});

    // A token from the flags or the environment is never sent to a URL it
    // was not given with.
    if (!picked.url) throw new RemoteUrlMissingError();

    // A URL without a token: the saved token is for the saved URL only.
    const sameUrl: boolean =
        saved?.url !== undefined &&
        normalizeBaseUrl(saved.url) === normalizeBaseUrl(picked.url);
    if (!sameUrl) throw new RemoteTokenMissingError();
    return requireRemoteTarget({ url: picked.url, token: saved?.token });
};
