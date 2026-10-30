import { createAdmin } from "./createAdmin";
import { findActiveAdmin } from "./findActiveAdmin";
import { findFirstOrganization } from "./findFirstOrganization";
import { listActiveAdmins } from "./listActiveAdmins";

export const BootstrapRepository = {
    findActiveAdmin,
    findFirstOrganization,
    createAdmin,
    listActiveAdmins,
};
