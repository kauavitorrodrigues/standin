import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TooltipSide = ComponentProps<typeof TooltipContent>["side"];

type FloatingIconButtonProps = {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
    tooltipSide?: TooltipSide;
    disabled?: boolean;
};

export const FloatingIconButton = ({
    icon,
    label,
    onClick,
    className,
    tooltipSide = "left",
    disabled = false,
}: FloatingIconButtonProps) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label={label}
                    onClick={onClick}
                    disabled={disabled}
                    className={cn(
                        "bg-neutral-900/50 text-white hover:bg-neutral-900/70 hover:text-white",
                        className
                    )}
                />
            }
        >
            {icon}
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
);
