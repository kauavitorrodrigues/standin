import {
    db,
    globalSettingsTable,
    eq,
    GLOBAL_SETTINGS_ROW_ID,
} from "@standin/database";
import type {
    GlobalSettings,
    GlobalSettingsUpdateInput,
} from "@standin/contracts";
import { settingsSelect } from "./consts";
import { getGlobalSettings } from "./get";

export const updateGlobalSettings = async (
    data: GlobalSettingsUpdateInput
): Promise<GlobalSettings> => {
    // Makes sure the row exists before it is updated.
    await getGlobalSettings();

    const [row] = await db
        .update(globalSettingsTable)
        .set(data)
        .where(eq(globalSettingsTable.id, GLOBAL_SETTINGS_ROW_ID))
        .returning(settingsSelect);

    return row;
};
