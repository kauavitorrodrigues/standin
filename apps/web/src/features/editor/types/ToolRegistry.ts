import type { EditorTool } from "@/features/editor/types/tool";
import type { ToolController } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

export type ToolControllerFactory = (env: ToolEnv) => ToolController;

// A tool with no entry does nothing on the canvas.
export type ToolRegistry = Partial<Record<EditorTool, ToolControllerFactory>>;
