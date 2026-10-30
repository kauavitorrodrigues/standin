import type { ReactNode } from "react";
import { SOUNDBOARD_TABLE_ROW_HEIGHT_PX } from "../../../consts/listLayout";
import { cn } from "@/lib/utils";

type Props = {
    // The grid template of the columns the row has.
    template: string;
    // This clip is the one being listened to: a primary accent on the left.
    isActive: boolean;
    children: ReactNode;
};

// One row of the table. The accent is always there, transparent, so showing
// it moves nothing.
export const TableRowFrame = ({ template, isActive, children }: Props) => (
    <div
        role="row"
        className={cn(
            "group/tile grid items-center gap-2 border-l-2 border-transparent px-3 transition-colors hover:bg-foreground/5",
            isActive && "border-primary bg-foreground/5"
        )}
        style={{
            height: SOUNDBOARD_TABLE_ROW_HEIGHT_PX,
            gridTemplateColumns: template,
        }}
    >
        {children}
    </div>
);
