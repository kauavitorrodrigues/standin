import { SURFACE_TYPES } from "@standin/contracts";
import type { AssetDef } from "../types/asset-def";

export const acceptsSurfaceItems = (type: AssetDef["type"]): boolean =>
    (SURFACE_TYPES as readonly string[]).includes(type);
