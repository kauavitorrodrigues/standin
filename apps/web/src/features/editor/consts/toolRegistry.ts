import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { createBrushController } from "@/features/editor/lib/createBrushController";
import { createBucketController } from "@/features/editor/lib/createBucketController";
import { createEraseController } from "@/features/editor/lib/createEraseController";
import { createPickerController } from "@/features/editor/lib/createPickerController";
import { createRectController } from "@/features/editor/lib/createRectController";
import { createRectOutlineController } from "@/features/editor/lib/createRectOutlineController";
import { createSelectController } from "@/features/editor/lib/createSelectController";
import { createZoneController } from "@/features/editor/lib/createZoneController";
import type { ToolRegistry } from "@/features/editor/types/ToolRegistry";

// Which controller each tool uses. A tool with no line does nothing on the
// canvas. To add a tool, import its factory and
// add ONE line: `[EDITOR_TOOLS.PAINT]: createBrushController,`
export const TOOL_REGISTRY: ToolRegistry = {
    [EDITOR_TOOLS.SELECT]: createSelectController,
    [EDITOR_TOOLS.ZONE]: createZoneController,
    [EDITOR_TOOLS.PAINT]: createBrushController,
    [EDITOR_TOOLS.ERASE]: createEraseController,
    [EDITOR_TOOLS.RECT]: createRectController,
    [EDITOR_TOOLS.RECT_OUTLINE]: createRectOutlineController,
    [EDITOR_TOOLS.BUCKET]: createBucketController,
    [EDITOR_TOOLS.PICKER]: createPickerController,
};
