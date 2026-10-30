import type { CliEnv } from "../types";

// The query counter of the database package prints to stdout, which would
// break --json. It is a dev aid of the API and has no use here.
export const clearQueryCount = (env: CliEnv): void => {
    delete env.DB_QUERY_COUNT;
};
