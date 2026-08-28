import { text, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

// DATE COLUMNS

export const createdAtColumn = () =>
    timestamp("created_at", { mode: "date" }).defaultNow().notNull();

export const updatedAtColumn = () =>
    timestamp("updated_at", { mode: "date" })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull();

export const deletedAtColumn = () => timestamp("deleted_at", { mode: "date" });

// PRIMARY KEY COLUMNS

export const uuidPrimaryKeyColumn = () =>
    text("id")
        .primaryKey()
        .$defaultFn(() => uuidv7());
