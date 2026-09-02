import { createOrganization } from "./create";
import { listOrganizationsByUser } from "./listByUser";
import { findOrganizationById } from "./findById";
import { findOrganizationMembership } from "./findMembership";
import { isOrganizationOwner } from "./isOwner";
import { updateOrganization } from "./update";
import { deleteOrganization } from "./delete";
import { OrganizationMemberService } from "./members";

export const OrganizationService = {
    create: createOrganization,
    listByUser: listOrganizationsByUser,
    findById: findOrganizationById,
    findMembership: findOrganizationMembership,
    isOwner: isOrganizationOwner,
    update: updateOrganization,
    delete: deleteOrganization,
    members: OrganizationMemberService,
};
