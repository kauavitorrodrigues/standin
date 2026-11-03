import type { ReactNode } from "react";
import { InfoHint } from "../views/InfoHint";

type Props = {
    title: string;
    // Shown as the tooltip of the info icon next to the title.
    hint?: string;
    children: ReactNode;
};

// One card of a screen: its title and the fields under it, spaced alike on
// every tab.
export const InviteSection = ({ title, hint, children }: Props) => (
    <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
            {title}
            {hint && <InfoHint text={hint} />}
        </h3>
        {children}
    </section>
);
