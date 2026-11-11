import { lookup } from "node:dns/promises";
import { WebsitePreviewBlockedAddressError } from "@standin/contracts";
import type { GuardedLookup, ResolveAddresses } from "../types";
import { isPublicAddress } from "./isPublicAddress";

const resolveWithDns: ResolveAddresses = (hostname) =>
    lookup(hostname, { all: true });

/**
 * The `lookup` of the connection. The check is made on the very addresses the
 * socket is about to use, so a name that answers with a public address to a
 * check and a private one to the connection (DNS rebinding) gets nowhere. One
 * private address among the answers is enough to refuse the name.
 */
export const createGuardedLookup =
    (resolve: ResolveAddresses = resolveWithDns): GuardedLookup =>
    (hostname, options, callback) => {
        resolve(hostname).then(
            (addresses) => {
                const [first] = addresses;
                const isAllowed =
                    first !== undefined &&
                    addresses.every(({ address }) => isPublicAddress(address));
                if (!isAllowed) {
                    return callback(
                        new WebsitePreviewBlockedAddressError(),
                        "",
                        0
                    );
                }
                if (options.all) return callback(null, addresses);

                callback(null, first.address, first.family);
            },
            (error: NodeJS.ErrnoException) => callback(error, "", 0)
        );
    };
