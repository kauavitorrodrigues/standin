import { asc, db, usersTable } from "@standin/database";
import type { ActiveAdmin } from "../types";
import { buildActiveAdminCondition } from "./buildActiveAdminCondition";

// Every active admin, by email, so a caller can pick one without guessing.
export const listActiveAdmins = async (): Promise<ActiveAdmin[]> =>
    db
        .select({ id: usersTable.id, email: usersTable.email })
        .from(usersTable)
        .where(buildActiveAdminCondition())
        .orderBy(asc(usersTable.email));
