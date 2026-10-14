import { EDITOR_TOOLS } from "@/features/maps/__shared__/consts/tools";
import { createBrushController } from "@/features/maps/__shared__/lib/createBrushController";
import { createBucketController } from "@/features/maps/__shared__/lib/createBucketController";
import { createEraseController } from "@/features/maps/__shared__/lib/createEraseController";
import { createPickerController } from "@/features/maps/__shared__/lib/createPickerController";
import { createRectController } from "@/features/maps/__shared__/lib/createRectController";
import { createSelectController } from "@/features/maps/__shared__/lib/createSelectController";
import { createZoneController } from "@/features/maps/__shared__/lib/createZoneController";
import type { ToolRegistry } from "@/features/maps/__shared__/types/ToolRegistry";

// Which controller each tool uses. A tool with no line does nothing on the
// canvas. To add a tool, import its factory and
// add ONE line: `[EDITOR_TOOLS.PAINT]: createBrushController,`
export const TOOL_REGISTRY: ToolRegistry = {
    [EDITOR_TOOLS.SELECT]: createSelectController,
    [EDITOR_TOOLS.ZONE]: createZoneController,
    [EDITOR_TOOLS.PAINT]: createBrushController,
    [EDITOR_TOOLS.ERASE]: createEraseController,
    [EDITOR_TOOLS.RECT]: createRectController,
    [EDITOR_TOOLS.BUCKET]: createBucketController,
    [EDITOR_TOOLS.PICKER]: createPickerController,
};
