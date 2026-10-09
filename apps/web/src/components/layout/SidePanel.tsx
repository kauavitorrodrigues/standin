import type { ReactNode } from "react";
import { PanelLeftCloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    title: string;
    closeLabel: string;
    onClose: () => void;
    // The panel is leaving: plays the exit animation.
    isClosing: boolean;
    width: string;
    children: ReactNode;
    className?: string;
};

// A panel docked beside the rail, on the left. It does not cover the page:
// the caller shifts the content by the same width while it is mounted. The
// rail offset comes from the --rail-width variable of the page body.
export const SidePanel = ({
    title,
    closeLabel,
    onClose,
    isClosing,
    width,
    children,
    className,
}: Props) => (
    <aside
        aria-label={title}
        style={{ width }}
        className={cn(
            "absolute inset-y-0 left-(--rail-width) z-20 flex flex-col overflow-hidden border-l bg-background duration-200 fill-mode-forwards",
            isClosing
                ? "animate-out fade-out-0 slide-out-to-left-8"
                : "animate-in fade-in-0 slide-in-from-left-8",
            className
        )}
    >
        <header className="flex items-center justify-between px-4 pt-3 pb-2">
            <h2 className="truncate text-lg font-semibold">{title}</h2>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={closeLabel}
                onClick={onClose}
                className="text-muted-foreground"
            >
                <PanelLeftCloseIcon />
            </Button>
        </header>
        {children}
    </aside>
);
