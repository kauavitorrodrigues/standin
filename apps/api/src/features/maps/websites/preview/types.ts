import type { LookupAddress, LookupOptions } from "node:dns";

export type ResolveAddresses = (hostname: string) => Promise<LookupAddress[]>;

// The shape `https.request` expects of its `lookup` option.
export type GuardedLookup = (
    hostname: string,
    options: LookupOptions,
    callback: (
        error: NodeJS.ErrnoException | null,
        address: string | LookupAddress[],
        family?: number
    ) => void
) => void;

export type FetchOptions = {
    acceptedTypes: readonly string[];
    maxBytes: number;
    // What happens when the answer is larger than `maxBytes`: the start of it
    // is kept (a page, whose head is all that is read), or it is refused (an
    // icon, which is useless cut short).
    overflow: "truncate" | "reject";
};

export type FetchedResource = {
    finalUrl: string;
    contentType: string;
    body: Buffer;
};

export type FetchResource = (
    url: string,
    options: FetchOptions
) => Promise<FetchedResource>;

export type PageMetadata = {
    title: string | null;
    // Candidates in the order to try, the page's own declarations only.
    iconHrefs: string[];
};

// What one request ends in: the answer, or a redirect to follow.
export type FetchStep =
    | { kind: "resource"; resource: Omit<FetchedResource, "finalUrl"> }
    | { kind: "redirect"; location: string };
