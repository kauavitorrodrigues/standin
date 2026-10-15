// Structural equality for plain data (objects, arrays and primitives). A shared
// reference is equal without a look inside, which keeps the check cheap: the
// draft reuses every part of the base that no operation touched.
export const isSameValue = (a: unknown, b: unknown): boolean => {
    if (Object.is(a, b)) return true;
    if (typeof a !== "object" || typeof b !== "object") return false;
    if (a === null || b === null) return false;

    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        return a.every((item, index) => isSameValue(item, b[index]));
    }

    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    if (keys.length !== Object.keys(right).length) return false;
    return keys.every(
        (key) => key in right && isSameValue(left[key], right[key])
    );
};
