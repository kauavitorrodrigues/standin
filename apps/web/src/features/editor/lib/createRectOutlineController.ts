import { rectOutlineCells } from "@standin/contracts";
import { createRectShapeController } from "@/features/editor/lib/createRectShapeController";
import type { ToolController } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

// The hollow rectangle (B). It paints only the border of the area between the
// press and the pointer, so the middle stays as it was.
export const createRectOutlineController = (env: ToolEnv): ToolController =>
    createRectShapeController(env, rectOutlineCells);
