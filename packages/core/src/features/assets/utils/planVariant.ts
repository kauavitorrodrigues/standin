import {
    BaseColorRequiredIssue,
    DataInvalidIssue,
    FootprintRequiredForNewRotationIssue,
    VariantDuplicatedIssue,
    VariantOverrideNotAllowedIssue,
    VariantSizeMismatchIssue,
} from "@standin/contracts";
import type {
    CreateVariantData,
    FootprintMask,
    LibraryIssue,
} from "@standin/contracts";
import type { ImageSize } from "../../../lib/types";
import type { AssetRow } from "../types";
import { readFrameSize } from "./readFrameSize";
import {
    findActionParamsIssue,
    findFootprintIssue,
    findFootprintMaskIssue,
    resolveFootprintMasks,
} from "./ruleIssues";

const EMPTY = "";

export type VariantValues = {
    rotation: AssetRow["rotation"];
    color: { key: string; hex: string } | null;
    frame: { w: number; h: number };
    footprint: {
        w: number;
        h: number;
        offsetX: number;
        mask: FootprintMask | null;
        solidMask: FootprintMask | null;
    };
    actionParams: AssetRow["actionParams"];
    // True when the family already had a row with this rotation.
    copiesSibling: boolean;
};

export type VariantPlan = {
    errors: LibraryIssue[];
    // Set only when there are no errors.
    values: VariantValues | null;
};

/**
 * The rules of a new variation that need no database, given the base and the
 * live rows of its family.
 *
 * - A color on a rotation the family already has copies the footprint and the
 *   action params of the sibling, refuses overrides and needs the same frame.
 * - A new rotation needs its own footprint (and action params when the base
 *   has an action), and only has to fit its own frame.
 * - The frame follows the animation of the base, a strip of its frame count.
 */
export const planVariant = (
    base: AssetRow,
    family: AssetRow[],
    data: CreateVariantData,
    size: ImageSize | null
): VariantPlan => {
    const errors: LibraryIssue[] = [];

    const rotation = data.rotation ?? base.rotation;
    const color = data.color ?? null;
    const sameRotation = family.filter((row) => row.rotation === rotation);
    const sibling = sameRotation[0] ?? null;

    if (color && base.colorKey === null) {
        errors.push(new BaseColorRequiredIssue());
    }
    if (!color && base.colorKey !== null) {
        errors.push(
            new DataInvalidIssue(
                "color",
                "A variation of a colored base asset needs a color."
            )
        );
    }
    const duplicated = family.some(
        (row) =>
            row.rotation === rotation &&
            (row.colorKey ?? EMPTY) === (color?.key ?? EMPTY)
    );
    if (duplicated) errors.push(new VariantDuplicatedIssue());

    if (sibling) {
        if (data.footprint) {
            errors.push(new VariantOverrideNotAllowedIssue("footprint"));
        }
        if (data.actionParams) {
            errors.push(new VariantOverrideNotAllowedIssue("actionParams"));
        }
    } else {
        if (!data.footprint) {
            errors.push(new FootprintRequiredForNewRotationIssue("footprint"));
        }
        if (base.action && !data.actionParams) {
            errors.push(
                new FootprintRequiredForNewRotationIssue("actionParams")
            );
        }
        if (data.actionParams) {
            const actionIssue = findActionParamsIssue(
                base.action,
                data.actionParams
            );
            if (actionIssue) errors.push(actionIssue);
        }
    }

    let frame: { w: number; h: number } | null = null;
    if (size) {
        const read = readFrameSize(size, base.animation?.frameCount ?? null);
        errors.push(...read.issues);
        frame = read.frame;
    }
    if (frame && sibling) {
        if (frame.w !== sibling.spriteW || frame.h !== sibling.spriteH) {
            errors.push(new VariantSizeMismatchIssue());
        }
    }

    const footprint = sibling
        ? {
              w: sibling.footprintW,
              h: sibling.footprintH,
              offsetX: sibling.footprintOffsetX,
              mask: sibling.footprintMask,
              solidMask: sibling.footprintSolidMask,
          }
        : data.footprint
          ? {
                offsetX: 0,
                ...data.footprint,
                ...resolveFootprintMasks(data.footprint),
            }
          : null;
    const maskIssue = footprint
        ? findFootprintMaskIssue(footprint, base.animation !== null)
        : null;
    if (maskIssue && !sibling) errors.push(maskIssue);
    if (frame && !sibling && footprint) {
        const footprintIssue = findFootprintIssue(footprint, frame);
        if (footprintIssue) errors.push(footprintIssue);
    }

    if (errors.length > 0 || !frame || !footprint) {
        return { errors, values: null };
    }
    return {
        errors,
        values: {
            rotation,
            color,
            frame,
            footprint,
            actionParams: sibling
                ? sibling.actionParams
                : (data.actionParams ?? null),
            copiesSibling: sibling !== null,
        },
    };
};
