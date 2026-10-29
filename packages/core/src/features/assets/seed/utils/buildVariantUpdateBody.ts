import type { SeedVariant } from "../types";
import { stripUndefined } from "./stripUndefined";

/** Only the fields the variant states. */
export const buildVariantUpdateBody = (entry: SeedVariant) =>
    stripUndefined({
        rotation: entry.rotation,
        color: entry.color,
        footprint: entry.footprint,
        actionParams: entry.actionParams,
    });
