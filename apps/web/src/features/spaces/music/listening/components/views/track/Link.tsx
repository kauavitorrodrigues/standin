import type { ReactNode } from "react";

type Props = {
    href: string;
    // Read by screen readers, since the card is a link and not a text.
    label: string;
    children: ReactNode;
};

// The card as a whole: it opens the track in a new tab.
export const Link = ({ href, label, children }: Props) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="group relative flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
        {children}
    </a>
);
