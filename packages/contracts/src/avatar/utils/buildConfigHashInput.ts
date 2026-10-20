import { AVATAR_GRID_VERSION } from "../consts/dimensions";
import { AVATAR_SLOTS } from "../enums/slots";
import type { AvatarHashBase, AvatarHashPart } from "../types/layer";
import { selectEffectiveParts } from "./orderLayers";

const compareKeys = (a: string, b: string) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

// JSON with the keys of every object sorted, so the same data always gives
// the same text.
export const canonicalJson = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map(canonicalJson).join(",")}]`;
    }
    if (value !== null && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, entry]) => entry !== undefined)
            .sort(([a], [b]) => compareKeys(a, b));
        return `{${entries
            .map(
                ([key, entry]) =>
                    `${JSON.stringify(key)}:${canonicalJson(entry)}`
            )
            .join(",")}}`;
    }
    return JSON.stringify(value);
};

// The text whose sha256 is the `config_hash` of an assembled sheet. It holds
// the grid version, the base and only the effective parts (with a costume,
// only it and no base, since the base is not drawn), in drawing order, with
// the file of each sheet. Swapping a PNG creates a new file id, so the text
// changes by itself. A color is another part, so it is already in the part id
// and in the file.
export const buildConfigHashInput = (
    parts: readonly AvatarHashPart[],
    base: AvatarHashBase | null,
    gridVersion: number = AVATAR_GRID_VERSION
): string => {
    const effective = selectEffectiveParts(parts);
    const hasCostume = effective.some(
        (part) => part.slot === AVATAR_SLOTS.COSTUME
    );

    return canonicalJson({
        gridVersion,
        base:
            base === null || hasCostume
                ? null
                : { baseId: base.baseId, fileId: base.fileId },
        layers: effective.map((part) => ({
            slot: part.slot,
            partId: part.partId,
            fileId: part.fileId,
        })),
    });
};
