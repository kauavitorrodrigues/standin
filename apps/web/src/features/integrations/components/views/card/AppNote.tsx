import { InfoIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

// A short warning or tip inside a step.
export const AppNote = ({ children }: Props) => (
    <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-[13px] text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0" />
        <div>{children}</div>
    </div>
);
