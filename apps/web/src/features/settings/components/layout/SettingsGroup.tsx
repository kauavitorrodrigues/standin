import type { ReactNode } from "react";

// A labelled block of rows. Blocks are separated by a rule, like the
// language and appearance blocks of the general section.
export const SettingsGroup = ({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) => (
    <section className="flex flex-col gap-4 border-b px-6 py-5 last:border-b-0">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
        </h3>
        {children}
    </section>
);
