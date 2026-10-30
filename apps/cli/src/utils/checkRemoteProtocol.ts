import { HTTP_PROTOCOL, HTTPS_PROTOCOL, LOOPBACK_HOSTS } from "../consts/api";
import { RemoteUrlInvalidError } from "../errors/RemoteUrlInvalidError";

// https for any host; http only where the traffic stays on this machine.
export const checkRemoteProtocol = (url: URL): void => {
    if (url.protocol === HTTPS_PROTOCOL) return;
    if (url.protocol !== HTTP_PROTOCOL) throw new RemoteUrlInvalidError();
    if (LOOPBACK_HOSTS[url.hostname] === true) return;
    throw new RemoteUrlInvalidError("INSECURE");
};
