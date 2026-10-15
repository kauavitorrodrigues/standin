import type { LucideIcon } from "lucide-react";

// A filter being applied, ready to show as a chip.
export type ActiveFilterChip = {
    field: string;
    title: string;
    label: string;
    icon?: LucideIcon;
};
