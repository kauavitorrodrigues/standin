import { createOrganization } from "./create";
import { listOrganizations } from "./list";
import { updateOrganization } from "./update";
import { deleteOrganization } from "./delete";
import { MemberController } from "./members";

export const OrganizationController = {
    create: createOrganization,
    list: listOrganizations,
    update: updateOrganization,
    delete: deleteOrganization,
    members: MemberController,
};
