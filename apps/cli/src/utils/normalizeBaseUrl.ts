import { RemoteUrlInvalidError } from "../errors/RemoteUrlInvalidError";
import { checkRemoteProtocol } from "./checkRemoteProtocol";
import { parseUrl } from "./parseUrl";

const TRAILING_SLASHES: RegExp = /\/+$/;

// The base URL without a trailing slash, so a path can be added to it. https,
// or http for this machine only.
export const normalizeBaseUrl = (raw: string): string => {
    const url: URL | undefined = parseUrl(raw);
    if (!url) throw new RemoteUrlInvalidError();
    checkRemoteProtocol(url);
    // Credentials in the URL would end up in logs and in the config file.
    url.username = "";
    url.password = "";
    url.hash = "";
    url.search = "";
    return url.toString().replace(TRAILING_SLASHES, "");
};
