import type { AssetDefinition } from "@standin/contracts";
import { AUTHORING_ISSUE_CODES, createIssue } from "../../issues";
import type { AuthoringIssue, LibraryIndex } from "../../types";

/**
 * Looks up the asset of a key, and checks its type when one is asked for. A
 * problem is pushed to `issues` and the asset is null, so every spot of a desk
 * is checked in one pass.
 */
export const resolveDeskAsset = (
    index: LibraryIndex,
    issues: AuthoringIssue[],
    key: string,
    type: AssetDefinition["type"] | null
): AssetDefinition | null => {
    const resolved = index.asset(key);
    if (!resolved.ok) {
        issues.push(resolved.issue);
        return null;
    }
    if (type && resolved.value.type !== type) {
        issues.push(
            createIssue(
                AUTHORING_ISSUE_CODES.WRONG_ASSET_TYPE,
                `library.assets.${key}`,
                { key, expected: type }
            )
        );
        return null;
    }

    return resolved.value;
};
