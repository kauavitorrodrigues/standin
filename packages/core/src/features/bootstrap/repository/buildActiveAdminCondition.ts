import { and, eq, isNull, usersTable } from "@standin/database";
import { USER_ROLES } from "@standin/contracts";

// An admin that was not deleted: the only people a service token may act as.
export const buildActiveAdminCondition = () =>
    and(eq(usersTable.role, USER_ROLES.ADMIN), isNull(usersTable.deletedAt));
