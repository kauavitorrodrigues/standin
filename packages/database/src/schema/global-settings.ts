import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { DEFAULT_GLOBAL_SETTINGS } from "@standin/contracts";
import { createdAtColumn, updatedAtColumn } from "./common";

// A single row (its id is always `global`). The defaults keep an instance
// open; a fresh one is seeded from the environment when the API starts.
export const GLOBAL_SETTINGS_ROW_ID = "global";

export const globalSettingsTable = pgTable("global_settings", {
    // Primary key column
    id: text("id").primaryKey().default(GLOBAL_SETTINGS_ROW_ID),

    // Properties columns
    allowSignup: boolean("allow_signup")
        .notNull()
        .default(DEFAULT_GLOBAL_SETTINGS.allowSignup),
    allowOrganizationCreation: boolean("allow_organization_creation")
        .notNull()
        .default(DEFAULT_GLOBAL_SETTINGS.allowOrganizationCreation),
    allowSpaceCreation: boolean("allow_space_creation")
        .notNull()
        .default(DEFAULT_GLOBAL_SETTINGS.allowSpaceCreation),

    // Date columns
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
});
