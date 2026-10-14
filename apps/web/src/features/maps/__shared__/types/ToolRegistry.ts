import type { EditorTool } from "@/features/maps/__shared__/types/tool";
import type { ToolController } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";

export type ToolControllerFactory = (env: ToolEnv) => ToolController;

// A tool with no entry does nothing on the canvas.
export type ToolRegistry = Partial<Record<EditorTool, ToolControllerFactory>>;
