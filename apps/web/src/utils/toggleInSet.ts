/** A copy of the set with the value taken out if it was in, put in if not. */
export const toggleInSet = <T>(set: ReadonlySet<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (!next.delete(value)) next.add(value);
    return next;
};
