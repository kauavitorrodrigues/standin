import { appConnectionsTable, db } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { AppConnectionKey } from "../types";
import { connectionIs } from "./conditions";

/** Keeps the refresh token Spotify rotated, sealed by the caller. */
export const updateRefreshToken = async (
    key: AppConnectionKey,
    refreshTokenSealed: string,
    executor: DbExecutor = db
): Promise<void> => {
    await executor
        .update(appConnectionsTable)
        .set({ refreshTokenSealed })
        .where(connectionIs(key));
};
