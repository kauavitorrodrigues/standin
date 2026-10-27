import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { queryLogger } from "./queryCounter";

// The default of the driver is 10, which a space where everybody joins at once
// can use up. Configurable so a host with less room for connections can lower
// it.
const DEFAULT_POOL_MAX = 20;

const resolvePoolMax = (): number => {
    const configured = Number(process.env.DATABASE_POOL_MAX);
    return Number.isInteger(configured) && configured > 0
        ? configured
        : DEFAULT_POOL_MAX;
};

export const db = drizzle({
    connection: {
        connectionString: process.env.DATABASE_URL!,
        max: resolvePoolMax(),
    },
    schema,
    casing: "snake_case",
    // Set only when DB_QUERY_COUNT is on.
    logger: queryLogger,
});

export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export { countQueries } from "./queryCounter";
export * from "./schema";
export * from "drizzle-orm";
