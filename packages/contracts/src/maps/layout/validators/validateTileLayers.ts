import { TILED_LAYER_TYPES } from "../../enums/tiled-layer-type";
import { LAYOUT_LAYER_NAMES } from "../../schemas/layout.schema";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import { getMaxGid, stripGidFlags } from "../gid";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import type { LayoutLibrary } from "../library";
import type { LooseLayout } from "../types/loose-layout";

export const validateTileLayers = (
    layout: LooseLayout,
    library: LayoutLibrary
): LayoutIssue[] => {
    const errors: LayoutIssue[] = [];
    const tileLayers = (layout.layers ?? []).filter(
        (layer) => layer.type === TILED_LAYER_TYPES.TILE_LAYER
    );

    if (!tileLayers.some((layer) => layer.name === LAYOUT_LAYER_NAMES.GROUND)) {
        errors.push(
            createIssue(
                Code.NO_TILE_LAYER,
                LAYOUT_LAYER_NAMES.GROUND,
                Messages.missingGroundLayer
            )
        );
    }

    const maxGid = getMaxGid(layout as never, library);
    const expectedLength = (layout.width ?? 0) * (layout.height ?? 0);

    for (const layer of tileLayers) {
        const path = layer.name ?? "layer";

        if (layer.width !== layout.width || layer.height !== layout.height) {
            errors.push(
                createIssue(
                    Code.LAYER_DIMENSION_MISMATCH,
                    path,
                    Messages.layerDimensionMismatch(path)
                )
            );
        }

        if (
            !Array.isArray(layer.data) ||
            layer.data.length !== expectedLength
        ) {
            errors.push(
                createIssue(
                    Code.LAYER_DATA_LENGTH,
                    path,
                    Messages.layerDataLength(path)
                )
            );
            continue;
        }

        const outOfRange = (layer.data as number[]).some((rawGid) => {
            const gid = stripGidFlags(rawGid);
            return gid !== 0 && gid > maxGid;
        });
        if (outOfRange) {
            errors.push(
                createIssue(
                    Code.GID_OUT_OF_RANGE,
                    path,
                    Messages.gidOutOfRange(path)
                )
            );
        }
    }

    return errors;
};
