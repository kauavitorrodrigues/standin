import { createOrganization } from "./create";
import { listOrganizations } from "./list";
import { updateOrganization } from "./update";
import { deleteOrganization } from "./delete";

export const OrganizationController = {
    create: createOrganization,
    list: listOrganizations,
    update: updateOrganization,
    delete: deleteOrganization,
};
