import { createAdmin } from "./createAdmin";
import { findActiveAdmin } from "./findActiveAdmin";
import { findFirstOrganization } from "./findFirstOrganization";

export const BootstrapRepository = {
    findActiveAdmin,
    findFirstOrganization,
    createAdmin,
};
