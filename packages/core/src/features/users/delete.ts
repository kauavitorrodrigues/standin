import { db, usersTable, eq } from "@standin/database";
import type { User } from "@standin/contracts";
import { IntegrationService } from "../integrations";
import { readUser } from "./utils/readUser";

export const deleteUser = async (id: string): Promise<User> => {
    await db.transaction(async (tx) => {
        await tx
            .update(usersTable)
            .set({ deletedAt: new Date() })
            .where(eq(usersTable.id, id));

        // The tokens of an account that is gone must not stay, nor hold a place.
        await IntegrationService.deleteByUserId(id, tx);
    });

    return readUser(id);
};
