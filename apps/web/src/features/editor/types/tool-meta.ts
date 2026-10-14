import type { LucideIcon } from "lucide-react";
import type { EditorTool } from "@/features/editor/types/tool";

export type EditorToolMeta = {
    value: EditorTool;
    label: string;
    // What it does, said in its tooltip.
    description: string;
    icon: LucideIcon;
    // The key that switches to this tool, as shown to the user.
    shortcut: string;
};
