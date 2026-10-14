import { PlacementController } from "@/features/maps/__shared__/lib/PlacementController";
import { PlacementGhost } from "@/features/maps/__shared__/lib/PlacementGhost";
import type { ToolController } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";

// The placement half of the SELECT tool. The registry is by tool and the
// object palette puts the editor on SELECT when it picks an asset, so the
// registered controller (createSelectController) composes this one with the
// selection. It does nothing while `placing` is null.
export const createPlacementController = (env: ToolEnv): ToolController =>
    new PlacementController(env, new PlacementGhost(env.scene));
