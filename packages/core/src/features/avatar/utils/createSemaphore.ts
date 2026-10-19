export type Semaphore = {
    run: <T>(task: () => Promise<T>) => Promise<T>;
};

/**
 * Lets at most `limit` tasks run at the same time. The others wait in the
 * order they arrived. It lives in memory, which is enough for a single
 * server.
 */
export const createSemaphore = (limit: number): Semaphore => {
    let running = 0;
    const waiting: (() => void)[] = [];

    const release = () => {
        const next = waiting.shift();
        if (next) {
            // The slot passes straight to the next task, so a newcomer
            // cannot take it in between.
            next();
            return;
        }
        running -= 1;
    };

    const acquire = async () => {
        if (running < limit) {
            running += 1;
            return;
        }
        await new Promise<void>((resolve) => waiting.push(resolve));
    };

    const run = async <T>(task: () => Promise<T>): Promise<T> => {
        await acquire();
        try {
            return await task();
        } finally {
            release();
        }
    };

    return { run };
};
