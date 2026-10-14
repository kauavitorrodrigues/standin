import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import { resolveGid } from "../../../layout/gid";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../../layout/issues";
import type { LayoutLibrary } from "../../../layout/library";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import { LAYOUT_LAYER_NAMES } from "../../../schemas/layout.schema";
import { STAMP_LAYER_ORDER } from "../../consts/stamp-layer-order";
import type { EditorModel } from "../../types/editor-model";
import type { Stamp } from "../../types/stamp";
import type { StampRect } from "../../types/stamp-rect";
import { isDerivedWallTop } from "./isDerivedWallTop";

type CapturedLayers = Pick<Stamp, "palette" | "layers"> & {
    issues: LayoutIssue[];
};

/**
 * Copies the four layers of the rectangle into palette indexes. A layer
 * without content is left out, and a gid the tilesets cannot resolve is an
 * issue. A wall top is left out, because it belongs to the wall below and
 * placing the wall writes it again. Stored, it would also need a tile meta
 * that tops usually do not have.
 */
export const captureStampLayers = (
    model: EditorModel,
    library: LayoutLibrary,
    rect: StampRect
): CapturedLayers => {
    const palette: Stamp["palette"] = [];
    const paletteIndex = new Map<string, number>();
    const layers: Stamp["layers"] = {};
    const issues: LayoutIssue[] = [];

    for (const layerName of STAMP_LAYER_ORDER) {
        const layer = findTileLayer(model.layout, layerName);
        if (!layer) continue;

        const data: number[] = [];
        for (let dy = 0; dy < rect.h; dy++) {
            for (let dx = 0; dx < rect.w; dx++) {
                const x = rect.x + dx;
                const y = rect.y + dy;
                const gid = layer.data[y * model.layout.width + x];
                const tile = resolveGid(model.layout, library, gid);

                const isTop =
                    layerName === LAYOUT_LAYER_NAMES.FOREGROUND &&
                    isDerivedWallTop(model, library, x, y, gid);
                if (gid !== 0 && !tile) {
                    issues.push(
                        createIssue(
                            Code.GID_OUT_OF_RANGE,
                            layerName,
                            Messages.gidOutOfRange(layerName)
                        )
                    );
                }
                if (!tile || isTop) {
                    data.push(0);
                    continue;
                }

                const key = `${tile.tilesetId}:${tile.tileIndex}`;
                if (!paletteIndex.has(key)) {
                    palette.push(tile);
                    paletteIndex.set(key, palette.length);
                }
                data.push(paletteIndex.get(key) ?? 0);
            }
        }

        if (data.some((value) => value !== 0)) layers[layerName] = data;
    }

    return { palette, layers, issues };
};
