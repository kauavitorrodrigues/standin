import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type PanelHeaderProps = {
    onClose: () => void;
};

// The title bar: the name on the left and the X on the right.
// The X closes the decorator and applies what was decorated.
export const PanelHeader = ({ onClose }: PanelHeaderProps) => (
    <div className="flex h-[3.25rem] shrink-0 items-center justify-between border-b px-3">
        <h2 className="text-sm font-semibold">Decorador</h2>
        <div className="flex items-center gap-0.5">
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
