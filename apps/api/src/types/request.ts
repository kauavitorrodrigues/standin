import type { User, OrganizationMembership } from "@standin/contracts";
import type { MapAccess } from "@standin/core";
import type { Request } from "express";

export type ExtendedRequest = Request & {
    user?: User;
    organizationMembership?: OrganizationMembership;
    mapAccess?: MapAccess;
    // The library an asset route works on: null is the global one.
    libraryScope?: { organizationId: string | null };
};
