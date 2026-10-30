import { globalSettingsTable } from "@standin/database";

export const settingsSelect = {
    allowSignup: globalSettingsTable.allowSignup,
    allowOrganizationCreation: globalSettingsTable.allowOrganizationCreation,
    allowSpaceCreation: globalSettingsTable.allowSpaceCreation,
};
