import type { AssetDefinition } from "../../types";

export const makeAsset = (
    overrides: Partial<AssetDefinition> & { id: string }
): AssetDefinition => ({
    key: overrides.id,
    name: "Caneca",
    type: "DECORATION",
    category: "FOOD_DRINK",
    baseAssetId: null,
    rotation: null,
    colorKey: null,
    colorHex: null,
    url: `/files/${overrides.id}`,
    sprite: { w: 32, h: 32 },
    footprint: { w: 1, h: 1, offsetX: 0 },
    placement: "SURFACE",
    surfaceHeightPx: 0,
    solid: false,
    action: null,
    actionParams: null,
    promptText: null,
    animation: null,
    ...overrides,
});

export const COLORS = {
    red: { colorKey: "red", colorHex: "#D64545" },
    blue: { colorKey: "blue", colorHex: "#3F6FD1" },
    green: { colorKey: "green", colorHex: "#2E9B57" },
    oak: { colorKey: "oak", colorHex: "#B98B5E" },
} as const;
