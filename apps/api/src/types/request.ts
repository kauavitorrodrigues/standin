import type { User, OrganizationMembership } from "@standin/contracts";
import type { MapAccess, SpaceRef } from "@standin/core";
import type { Request } from "express";

export type ExtendedRequest = Request & {
    user?: User;
    organizationMembership?: OrganizationMembership;
    mapAccess?: MapAccess;
    // The space a guest route works on, with the organization it belongs to.
    spaceRef?: SpaceRef;
    // The library an asset route works on: null is the global one.
    libraryScope?: { organizationId: string | null };
};
