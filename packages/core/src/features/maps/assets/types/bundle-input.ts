import type { Transaction } from "@standin/database";
import type { Item } from "./item";
import type { MapInfo } from "./map-info";

export type BundleInput = {
    tx: Transaction;
    map: MapInfo;
    items: Item[];
    root: Item;
    organizationId: string | null;
};
