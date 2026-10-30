import {
    db,
    globalSettingsTable,
    eq,
    GLOBAL_SETTINGS_ROW_ID,
} from "@standin/database";
import type { GlobalSettings } from "@standin/contracts";
import { settingsSelect } from "./consts";
import { readEnvDefaults } from "./utils/readEnvDefaults";

/**
 * The settings of the instance. The row is created from the environment the
 * first time anything reads it, and from then on the database wins: changing
 * the environment later does not touch an existing row. Read on every call so
 * a change applies without a restart.
 */
export const getGlobalSettings = async (): Promise<GlobalSettings> => {
    await db
        .insert(globalSettingsTable)
        .values({ id: GLOBAL_SETTINGS_ROW_ID, ...readEnvDefaults() })
        .onConflictDoNothing();

    const [row] = await db
        .select(settingsSelect)
        .from(globalSettingsTable)
        .where(eq(globalSettingsTable.id, GLOBAL_SETTINGS_ROW_ID));

    return row;
};
