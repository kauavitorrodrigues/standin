import type { User, OrganizationMembership } from "@standin/contracts";
import type { Request } from "express";

export type ExtendedRequest = Request & {
    user?: User;
    organizationMembership?: OrganizationMembership;
    // The library an asset route works on: null is the global one.
    libraryScope?: { organizationId: string | null };
};
