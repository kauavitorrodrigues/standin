import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
    isSelected: boolean;
    onSelect: () => void;
    // The dot or the icon in front of the label.
    icon: ReactNode;
    children: ReactNode;
};

/** One of the choices of the status of the person. */
export const UserStatusOption = ({
    isSelected,
    onSelect,
    icon,
    children,
}: Props) => (
    <Button
        type="button"
        variant="outline"
        size="lg"
        aria-pressed={isSelected}
        className="flex-1 gap-2 aria-pressed:border-emerald-500/40 aria-pressed:bg-emerald-500/10"
        onClick={onSelect}
    >
        {icon}
        {children}
    </Button>
);
