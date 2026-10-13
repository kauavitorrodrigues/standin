import { createOrganization } from "./create";
import { listOrganizationsByUser } from "./listByUser";
import { findOrganizationById } from "./findById";
import { findOrganizationMembership } from "./findMembership";
import { hasActiveOrganizationMembership } from "./hasActiveMembership";
import { isOrganizationOwner } from "./isOwner";
import { isOwnerOfAnyOrganization } from "./isOwnerOfAny";
import { updateOrganization } from "./update";
import { deleteOrganization } from "./delete";

export const OrganizationService = {
    create: createOrganization,
    listByUser: listOrganizationsByUser,
    findById: findOrganizationById,
    findMembership: findOrganizationMembership,
    hasActiveMembership: hasActiveOrganizationMembership,
    isOwner: isOrganizationOwner,
    isOwnerOfAny: isOwnerOfAnyOrganization,
    update: updateOrganization,
    delete: deleteOrganization,
};

export * from "./members";
