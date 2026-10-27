import type { types } from "mediasoup";
import type { MediaServerOptions } from "../types";
import { localAddresses } from "./localAddresses";

const PROTOCOLS = ["udp", "tcp"] as const;
const WILDCARD_ADDRESSES = ["0.0.0.0", "::"];

type Host = { ip: string; announcedAddress?: string };

// Where the server is reachable. With a public address configured it listens
// on the one address and announces that public one. Without it, listening on
// every address would announce 0.0.0.0, which no browser can use, so it listens
// on each real address of the machine and announces each of them instead.
const resolveHosts = (
    { listenIp, announcedAddress }: MediaServerOptions,
    addresses: () => string[]
): Host[] => {
    if (announcedAddress) return [{ ip: listenIp, announcedAddress }];
    if (WILDCARD_ADDRESSES.includes(listenIp)) {
        return addresses().map((ip) => ({ ip }));
    }
    return [{ ip: listenIp }];
};

/**
 * The one UDP and TCP port every client connects to, on each address the
 * server is reachable at.
 */
export const buildListenInfos = (
    options: MediaServerOptions,
    addresses: () => string[] = localAddresses
): types.TransportListenInfo[] =>
    resolveHosts(options, addresses).flatMap((host) =>
        PROTOCOLS.map((protocol) => ({
            protocol,
            ip: host.ip,
            announcedAddress: host.announcedAddress,
            port: options.listenPort,
        }))
    );
