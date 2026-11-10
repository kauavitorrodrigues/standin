import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

// The square that holds the logo of an app, in the card and in its dialog.
export const AppIcon = ({ children }: Props) => (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-foreground/10">
        {children}
    </div>
);
