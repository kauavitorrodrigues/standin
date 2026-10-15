import type { ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type PanelHeaderProps = {
    onClose: () => void;
    // What goes before the button that closes, such as the menu.
    children?: ReactNode;
};

// The title bar: the name on the left, and on the right the menu and the X.
// The X closes the decorator and applies what was decorated.
export const PanelHeader = ({ onClose, children }: PanelHeaderProps) => (
    <div className="flex h-[3.25rem] shrink-0 items-center justify-between border-b px-3">
        <h2 className="text-sm font-semibold">Decorador</h2>
        <div className="flex items-center gap-0.5">
            {children}
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Fechar e aplicar a decoração"
                onClick={onClose}
            >
                <XIcon />
            </Button>
        </div>
    </div>
);
