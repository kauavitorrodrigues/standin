import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!, {
    schema,
    casing: "snake_case",
});

export * from "./schema";
export * from "drizzle-orm";