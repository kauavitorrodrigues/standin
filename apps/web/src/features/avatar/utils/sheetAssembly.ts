import { AVATAR_SHEET_BYTES, compositeLayerOver } from "@standin/contracts";
import type { AvatarLayer } from "@standin/contracts";

// The sheet after each layer of the last assembly, keyed by the decoded sheet
// the layer came from. The sheets come from the query cache, so the same
// sheet is the same array.
type Step = { rgba: Uint8Array; sheet: Uint8Array };

let steps: Step[] = [];

const countSharedLayers = (layers: readonly AvatarLayer[]) => {
    let shared = 0;
    while (
        shared < steps.length &&
        shared < layers.length &&
        steps[shared].rgba === layers[shared].rgba
    ) {
        shared++;
    }
    return shared;
};

// `assembleSheet` of the layers, starting from what the last call already
// composed. A new color changes one layer and the ones over it, so the layers
// under it are not composed again. Each step is the exact state the full
// assembly passes through, so the result is the same bytes. The array that
// comes back is kept for the next call: do not change it.
export const assembleSheetIncremental = (
    layers: readonly AvatarLayer[]
): Uint8Array => {
    const shared = countSharedLayers(layers);
    const next = steps.slice(0, shared);

    for (let index = shared; index < layers.length; index++) {
        const sheet =
            index === 0
                ? new Uint8Array(AVATAR_SHEET_BYTES)
                : next[index - 1].sheet.slice();
        compositeLayerOver(sheet, layers[index].rgba);
        next.push({ rgba: layers[index].rgba, sheet });
    }

    steps = next;
    return next.at(-1)?.sheet ?? new Uint8Array(AVATAR_SHEET_BYTES);
};
