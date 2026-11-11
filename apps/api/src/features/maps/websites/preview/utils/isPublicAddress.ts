import { BlockList, isIP } from "node:net";
import { BLOCKED_IPV4_RANGES, BLOCKED_IPV6_RANGES } from "../consts";

const blocked = new BlockList();
BLOCKED_IPV4_RANGES.forEach(([network, prefix]) =>
    blocked.addSubnet(network, prefix, "ipv4")
);
BLOCKED_IPV6_RANGES.forEach(([network, prefix]) =>
    blocked.addSubnet(network, prefix, "ipv6")
);

/**
 * Whether an IP address is one the public internet can reach. Anything that
 * is not an address is not public. An IPv6 address that maps an IPv4 one
 * (::ffff:127.0.0.1) is judged by the IPv4 address inside it.
 */
export const isPublicAddress = (address: string): boolean => {
    switch (isIP(address)) {
        case 4:
            return !blocked.check(address, "ipv4");
        case 6:
            return !blocked.check(address, "ipv6");
        default:
            return false;
    }
};
