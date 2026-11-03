import type { OrganizationFixedLink } from "@standin/contracts";

// The columns of the fixed link the rules read.
export type FixedLinkRow = {
    id: string;
    organizationId: string;
    tokenEncrypted: string | null;
    createdAt: Date;
};

// What the database holds for the fixed link: the link with its token when it
// can be read, and whether a live one exists at all (it may be unreadable).
export type FixedLinkLookup = {
    link: OrganizationFixedLink | null;
    exists: boolean;
};
