import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    // The view this button leads to is the one on screen.
    active?: boolean;
    disabled?: boolean;
    badge?: ReactNode;
    className?: string;
};

export const RailButton = ({
    icon,
    label,
    onClick,
    active = false,
    disabled = false,
    badge,
    className,
}: Props) => {
    return (
        <span className={`relative inline-flex ${className ?? ""}`}>
            <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                disabled={disabled}
                aria-label={label}
                aria-pressed={active}
                onClick={onClick}
                icon={icon}
                className="size-11 rounded-xl text-muted-foreground hover:bg-foreground/10 hover:text-foreground aria-pressed:bg-foreground/10 aria-pressed:text-foreground [&_svg:not([class*='size-'])]:size-[22px]"
            />
            {badge && (
                <span className="pointer-events-none absolute top-1.5 right-1.5">
                    {badge}
                </span>
            )}
        </span>
    );
};
