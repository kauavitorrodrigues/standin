import type { AssetDef } from "./asset-def";
import type { Item } from "./item";
import type { MapInfo } from "./map-info";
import type { Position } from "./position";

export type GroundMoveInput = {
    current: Item;
    def: AssetDef;
    next: Position;
    requestedParentId: string | null | undefined;
    items: Item[];
    children: Item[];
    map: MapInfo;
};
