import { LIBRARY_ISSUE_CODES as CODES, type FamilyIssue } from "../errors";
import {
    ASSET_COLOR_HEX_PATTERN,
    ASSET_COLOR_KEY_PATTERN,
    MAX_ASSET_COLOR_KEY_LENGTH,
} from "../schemas/consts/fields";
import type { AssetDefinition } from "../types";

const NO_ROTATION = "none";

// Fields equal across the whole family. Editing any row edits all rows.
const FAMILY_FIELDS = [
    "name",
    "category",
    "type",
    "placement",
    "solid",
    "surfaceHeightPx",
    "action",
    "promptText",
    "animation",
] as const;

const stable = (value: unknown): string =>
    JSON.stringify(value, (_key, nested) =>
        nested && typeof nested === "object" && !Array.isArray(nested)
            ? Object.fromEntries(
                  Object.entries(nested).sort(([a], [b]) =>
                      a < b ? -1 : a > b ? 1 : 0
                  )
              )
            : nested
    );

const byId = (a: AssetDefinition, b: AssetDefinition) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

const issue = (
    code: FamilyIssue["code"],
    path: string,
    message: string
): FamilyIssue => ({ code, path, message });

const checkColor = (row: AssetDefinition): FamilyIssue[] => {
    const issues: FamilyIssue[] = [];
    if ((row.colorKey === null) !== (row.colorHex === null)) {
        issues.push(
            issue(
                CODES.COLOR_FIELDS_INCONSISTENT,
                row.key,
                `${row.key}: the color key and the color hex must come together.`
            )
        );
    }
    if (
        row.colorKey !== null &&
        (row.colorKey.length > MAX_ASSET_COLOR_KEY_LENGTH ||
            !ASSET_COLOR_KEY_PATTERN.test(row.colorKey))
    ) {
        issues.push(
            issue(
                CODES.COLOR_KEY_INVALID,
                row.key,
                `${row.key}: the color key is invalid.`
            )
        );
    }
    if (row.colorHex !== null && !ASSET_COLOR_HEX_PATTERN.test(row.colorHex)) {
        issues.push(
            issue(
                CODES.COLOR_HEX_INVALID,
                row.key,
                `${row.key}: the color hex is invalid.`
            )
        );
    }
    return issues;
};

const checkFamilyFields = (
    base: AssetDefinition,
    row: AssetDefinition
): FamilyIssue[] =>
    FAMILY_FIELDS.filter(
        (field) => stable(row[field]) !== stable(base[field])
    ).map((field) =>
        issue(
            CODES.FAMILY_FIELD_DIVERGES,
            `${row.key}.${field}`,
            `${row.key}: ${field} must equal the base asset.`
        )
    );

// Rotation class and size, for the rows of one rotation.
const checkRotationGroup = (group: AssetDefinition[]): FamilyIssue[] => {
    const [first, ...others] = [...group].sort(byId);
    const issues: FamilyIssue[] = [];
    for (const row of others) {
        if (stable(row.footprint) !== stable(first.footprint)) {
            issues.push(
                issue(
                    CODES.ROTATION_FIELD_DIVERGES,
                    `${row.key}.footprint`,
                    `${row.key}: footprint must equal ${first.key}.`
                )
            );
        }
        if (stable(row.actionParams) !== stable(first.actionParams)) {
            issues.push(
                issue(
                    CODES.ROTATION_FIELD_DIVERGES,
                    `${row.key}.actionParams`,
                    `${row.key}: actionParams must equal ${first.key}.`
                )
            );
        }
        if (stable(row.sprite) !== stable(first.sprite)) {
            issues.push(
                issue(
                    CODES.VARIANT_SIZE_MISMATCH,
                    `${row.key}.sprite`,
                    `${row.key}: the frame size must equal ${first.key}.`
                )
            );
        }
    }
    return issues;
};

/**
 * Checks the three field classes of one family (family, rotation and
 * variation), the base link and the uniqueness of color and rotation. The
 * server keeps these by construction, so this is for tests and diagnostics.
 */
export function validateFamily(rows: AssetDefinition[]): FamilyIssue[] {
    const bases = rows.filter((row) => row.baseAssetId === null);
    if (bases.length !== 1) {
        return [
            issue(
                CODES.FAMILY_BASE_MISSING,
                "family",
                "A family has exactly one base asset."
            ),
        ];
    }
    const [base] = bases;
    const issues: FamilyIssue[] = [];
    const seen = new Set<string>();
    const rotations = new Map<string, AssetDefinition[]>();

    for (const row of rows) {
        issues.push(...checkColor(row));

        if (row !== base) {
            if (row.baseAssetId !== base.id) {
                issues.push(
                    issue(
                        CODES.VARIANT_BASE_INVALID,
                        row.key,
                        `${row.key}: the base asset must be a base of this family.`
                    )
                );
            }
            if (row.colorKey !== null && base.colorKey === null) {
                issues.push(
                    issue(
                        CODES.BASE_COLOR_REQUIRED,
                        row.key,
                        `${row.key}: the base asset has no color.`
                    )
                );
            }
            issues.push(...checkFamilyFields(base, row));
        }

        const variation = `${row.colorKey ?? ""}|${row.rotation ?? ""}`;
        if (seen.has(variation)) {
            issues.push(
                issue(
                    CODES.VARIANT_DUPLICATED,
                    row.key,
                    `${row.key}: the color and rotation already exist in the family.`
                )
            );
        }
        seen.add(variation);

        const rotation = row.rotation ?? NO_ROTATION;
        rotations.set(rotation, [...(rotations.get(rotation) ?? []), row]);
    }

    for (const group of rotations.values()) {
        issues.push(...checkRotationGroup(group));
    }
    return issues;
}
