import type { Footprint } from "../types/footprint";
import type { Item } from "../types/item";
import { toFootprint } from "./toFootprint";

export const itemFootprint = (item: Item): Footprint => toFootprint(item, item);
