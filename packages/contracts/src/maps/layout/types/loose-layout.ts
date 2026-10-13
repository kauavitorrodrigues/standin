import type { LayoutObject } from "../../schemas/layout.schema";

// The layout is untrusted (it comes from json), so it is read loosely.
export type LooseLayer = {
    type?: string;
    name?: string;
    width?: number;
    height?: number;
    data?: unknown;
    objects?: LayoutObject[];
};

export type LooseLayout = {
    orientation?: unknown;
    infinite?: unknown;
    tilewidth?: unknown;
    tileheight?: unknown;
    width?: number;
    height?: number;
    tilesets?: { name: string; firstgid: number }[];
    layers?: LooseLayer[];
};
