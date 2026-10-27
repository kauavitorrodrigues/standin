import { AsyncLocalStorage } from "node:async_hooks";
import type { Logger } from "drizzle-orm/logger";

// Counts the queries the API sends to Postgres. Off by default: it is only
// built when DB_QUERY_COUNT is "1" or "true" and the mode is not production, so
// a normal run pays nothing and a stray flag cannot turn it on there.

const LOG_INTERVAL_MS = 1000;

type Scope = { label: string; count: number };

const scopes = new AsyncLocalStorage<Scope>();

export const isQueryCountEnabled = (
    value: string | undefined = process.env.DB_QUERY_COUNT,
    nodeEnv: string | undefined = process.env.NODE_ENV
): boolean => nodeEnv !== "production" && (value === "1" || value === "true");

export type QueryCounter = {
    logger: Logger;
    total: () => number;
    // Runs the work and logs how many queries it sent, including the ones in
    // async calls it started. Concurrent scopes do not mix.
    countScope: <T>(label: string, work: () => Promise<T>) => Promise<T>;
    stop: () => void;
};

type CounterOptions = {
    log?: (message: string) => void;
    intervalMs?: number;
};

export const createQueryCounter = ({
    log = (message) => console.log(message),
    intervalMs = LOG_INTERVAL_MS,
}: CounterOptions = {}): QueryCounter => {
    let total = 0;
    let loggedTotal = 0;

    const logger: Logger = {
        logQuery() {
            total += 1;
            const scope = scopes.getStore();
            if (scope) scope.count += 1;
        },
    };

    // Only seconds with traffic are logged, so an idle API stays quiet.
    const timer = setInterval(() => {
        const delta = total - loggedTotal;
        loggedTotal = total;
        if (delta > 0)
            log(`[db-query-count] ${delta} queries/s, total ${total}`);
    }, intervalMs);
    timer.unref();

    const countScope = async <T>(
        label: string,
        work: () => Promise<T>
    ): Promise<T> => {
        const scope: Scope = { label, count: 0 };
        try {
            return await scopes.run(scope, work);
        } finally {
            log(`[db-query-count] ${label}: ${scope.count} queries`);
        }
    };

    return {
        logger,
        total: () => total,
        countScope,
        stop: () => clearInterval(timer),
    };
};

const counter: QueryCounter | null = isQueryCountEnabled()
    ? createQueryCounter()
    : null;

export const queryLogger: Logger | undefined = counter?.logger;

// Without the flag this runs the work as is.
export const countQueries = <T>(
    label: string,
    work: () => Promise<T>
): Promise<T> => (counter ? counter.countScope(label, work) : work());
