import type { SequentialStep } from "../types";

/**
 * Runs the step over each item one after the other, never two at once, and
 * returns the results in order. The first rejection stops the chain, so the
 * later items never run.
 */
export const runSequentially = <T, R>(
    items: readonly T[],
    step: SequentialStep<T, R>
): Promise<R[]> =>
    items.reduce<Promise<R[]>>(
        (chain, item, index) =>
            chain.then(async (results) => {
                results.push(await step(item, index));
                return results;
            }),
        Promise.resolve([])
    );
