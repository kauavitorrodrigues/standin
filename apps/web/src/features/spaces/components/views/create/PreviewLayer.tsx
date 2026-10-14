import type { ReactNode } from "react";

type Props = { active: boolean; children: ReactNode };

// Every preview stays mounted and only the chosen one is visible. The images
// are loaded once, so switching the choice never waits for the network.
export const PreviewLayer = ({ active, children }: Props) => (
    <div
        data-active={active}
        aria-hidden={!active}
        className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 data-[active=true]:opacity-100"
    >
        {children}
    </div>
);
