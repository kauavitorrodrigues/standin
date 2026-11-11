import type { ReactNode } from "react";

type Props = {
    heading: string;
    children: ReactNode;
};

// The block of the profile card: a small label and what goes under it.
export const Section = ({ heading, children }: Props) => (
    <div className="mt-3 flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
            {heading}
        </span>
        {children}
    </div>
);
