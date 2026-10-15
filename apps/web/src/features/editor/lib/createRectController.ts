import { rectCells } from "@standin/contracts";
import { createRectShapeController } from "@/features/editor/lib/createRectShapeController";
import type { ToolController } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

// The rectangle (R). It fills the whole area between the press and the pointer.
export const createRectController = (env: ToolEnv): ToolController =>
    createRectShapeController(env, rectCells);
