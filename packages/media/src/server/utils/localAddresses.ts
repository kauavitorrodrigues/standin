import { networkInterfaces } from "node:os";

const LOOPBACK = "127.0.0.1";

// Virtual interfaces (Docker bridges, virtual machines) have addresses that no
// browser reaches, and each one would only add a useless candidate.
const VIRTUAL_INTERFACE_PREFIXES = [
    "docker",
    "br-",
    "veth",
    "virbr",
    "vboxnet",
];

const isVirtual = (name: string): boolean =>
    VIRTUAL_INTERFACE_PREFIXES.some((prefix) => name.startsWith(prefix));

/**
 * The IPv4 addresses of this machine that a browser can send media to: every
 * address of every network interface, plus the loopback. A browser only pairs
 * its own candidates with a server address it can really route to, and the
 * loopback alone is often not enough, so a test on one machine or on a LAN
 * needs the real addresses too.
 */
export const localAddresses = (
    interfaces: ReturnType<typeof networkInterfaces> = networkInterfaces()
): string[] => {
    const found = Object.entries(interfaces)
        .filter(([name]) => !isVirtual(name))
        .flatMap(([, list]) => list ?? [])
        .filter((entry) => entry.family === "IPv4" && !entry.internal)
        .map((entry) => entry.address);
    return [...new Set([LOOPBACK, ...found])];
};
