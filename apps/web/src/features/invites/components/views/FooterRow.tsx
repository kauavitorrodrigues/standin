import type { ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";

type Props = {
    icon: ReactNode;
    label: string;
    onClick: () => void;
};

// A row under the cards that opens another screen, with the chevron on the
// right as in the reference.
export const FooterRow = ({ icon, label, onClick }: Props) => (
    <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
        <span className="[&_svg]:size-4">{icon}</span>
        <span className="flex-1">{label}</span>
        <ChevronRightIcon className="size-4" />
    </button>
);
