import { listAdminOrganizations } from "./listOrganizations";
import { listAdminUsers } from "./listUsers";

export const AdminService = {
    listUsers: listAdminUsers,
    listOrganizations: listAdminOrganizations,
};
