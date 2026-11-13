import { useCreate } from "./create";
import { useLeave } from "./leave";

export const OrganizationMutations = {
    create: useCreate,
    leave: useLeave,
};
