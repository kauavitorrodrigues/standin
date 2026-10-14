import { ASSET_PLACEMENTS } from "../../../../assets/enums/asset-placement";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../../layout/issues";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import type { EditorModel } from "../../types/editor-model";
import type { Stamp } from "../../types/stamp";
import type { StampRect } from "../../types/stamp-rect";
import { footprintCells } from "../footprintCells";

type CapturedObjects = { objects: Stamp["objects"]; issues: LayoutIssue[] };

type Candidate = { placed: PlacedAsset; placement: string };

const isInside = (rect: StampRect, x: number, y: number): boolean =>
    x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;

/**
 * The objects whose footprint is fully inside the rectangle, parents before
 * children, with the position relative to the corner. An object only partly
 * inside is an issue, and so is a SURFACE item whose parent stayed out. A
 * piece of another placement whose parent stayed out goes in without a link.
 */
export const captureStampObjects = (
    model: EditorModel,
    rect: StampRect
): CapturedObjects => {
    const issues: LayoutIssue[] = [];
    const assets = new Map(model.library.assets.map((item) => [item.id, item]));
    const candidates = new Map<string, Candidate>();

    for (const placed of model.placed) {
        const asset = assets.get(placed.assetId);
        if (!asset) {
            issues.push(
                createIssue(
                    Code.STAMP_ASSET_UNAVAILABLE,
                    `objects.${placed.id}`,
                    Messages.stampAssetUnavailable
                )
            );
            continue;
        }

        const cells = footprintCells(asset, placed.tileX, placed.tileY);
        const inside = cells.filter(({ x, y }) => isInside(rect, x, y));
        if (inside.length === 0) continue;

        if (inside.length < cells.length) {
            issues.push(
                createIssue(
                    Code.STAMP_OBJECT_CROSSES_EDGE,
                    `objects.${placed.id}`,
                    Messages.stampObjectCrossesEdge
                )
            );
            continue;
        }
        candidates.set(placed.id, { placed, placement: asset.placement });
    }

    const ordered: Candidate[] = [];
    const visited = new Set<string>();
    const visit = (candidate: Candidate) => {
        if (visited.has(candidate.placed.id)) return;
        visited.add(candidate.placed.id);

        const parent = candidate.placed.parentId
            ? candidates.get(candidate.placed.parentId)
            : undefined;
        if (parent) visit(parent);

        const isLost =
            candidate.placed.parentId !== null &&
            !parent &&
            candidate.placement === ASSET_PLACEMENTS.SURFACE;
        if (isLost) {
            issues.push(
                createIssue(
                    Code.STAMP_PARENT_OUTSIDE,
                    `objects.${candidate.placed.id}`,
                    Messages.stampParentOutside
                )
            );
            return;
        }
        ordered.push(candidate);
    };
    candidates.forEach(visit);

    const indexById = new Map(
        ordered.map(({ placed }, index) => [placed.id, index])
    );
    const objects = ordered.map(({ placed }) => ({
        assetId: placed.assetId,
        dx: placed.tileX - rect.x,
        dy: placed.tileY - rect.y,
        offsetX: placed.offsetX,
        offsetY: placed.offsetY,
        parentIndex:
            (placed.parentId ? indexById.get(placed.parentId) : undefined) ??
            null,
    }));

    return { objects, issues };
};
