import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type ExtractedRow = {
    label: string;
    // A text, or a piece of UI when what it says depends on something.
    value: ReactNode;
    icon: LucideIcon;
    color: string;
    // Left out when false, so a row that only applies sometimes is declared
    // with the others.
    show?: boolean;
    // Shown at the end of the row, like a button to remove the file.
    action?: ReactNode;
};

export type ExtractedGroup = {
    title: string;
    rows: ExtractedRow[];
};
