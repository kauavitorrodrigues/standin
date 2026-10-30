import { RemoteTokenMissingError } from "../errors/RemoteTokenMissingError";
import { RemoteUrlMissingError } from "../errors/RemoteUrlMissingError";
import type { CliConfigFile, RemoteTarget } from "../types";
import { normalizeBaseUrl } from "../utils/normalizeBaseUrl";

// Both values or the error that says which one is missing.
export const requireRemoteTarget = (values: CliConfigFile): RemoteTarget => {
    if (!values.url) throw new RemoteUrlMissingError();
    if (!values.token) throw new RemoteTokenMissingError();
    return { url: normalizeBaseUrl(values.url), token: values.token };
};
