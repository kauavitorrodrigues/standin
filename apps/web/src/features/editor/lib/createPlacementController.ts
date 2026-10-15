import { PlacementController } from "@/features/editor/lib/PlacementController";
import { PlacementGhost } from "@/features/editor/lib/PlacementGhost";
import type { ToolController } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

// The placement half of the SELECT tool. The registry is by tool and the
// object palette puts the editor on SELECT when it picks an asset, so the
// registered controller (createSelectController) composes this one with the
// selection. It does nothing while `placing` is null.
export const createPlacementController = (env: ToolEnv): ToolController =>
    new PlacementController(env, new PlacementGhost(env.scene));
