import { EditorToolRail } from "@/features/editor/components/instances/EditorToolRail";
import { AREA_TOOL_META } from "../../consts/toolMeta";

// The tools of the map editor but the zone one, and no toggle of zones.
export const AreaToolRail = () => (
    <EditorToolRail tools={AREA_TOOL_META} withZones={false} />
);
