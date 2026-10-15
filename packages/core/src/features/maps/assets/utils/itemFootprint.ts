import { type Footprint } from "@standin/contracts";
import type { Item } from "../types/item";
import { toFootprint } from "./toFootprint";

export const itemFootprint = (item: Item): Footprint => toFootprint(item, item);
