/** JSON with object keys sorted, so equal values compare equal in any key order. */
export const stableJson = (value: unknown): string =>
    JSON.stringify(value ?? null, (_key, nested) =>
        nested && typeof nested === "object" && !Array.isArray(nested)
            ? Object.fromEntries(
                  Object.entries(nested).sort(([a], [b]) => (a < b ? -1 : 1))
              )
            : nested
    );
