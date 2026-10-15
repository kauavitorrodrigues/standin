import type { ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";

type Props = {
    // Usually the name as text. An editor of something new puts a field here.
    title: ReactNode;
    onExit: () => void;
    // The menu of whoever owns what is being edited, beside the title.
    actions?: ReactNode;
    // What goes on the right of the bar, before the button that closes the
    // panel.
    children?: ReactNode;
};

// The title bar of a side panel: the button that leaves, the name of what is
// edited and its menu on the left, and on the right whatever the editor puts
// there (the button that closes the panel among it).
export const SidePanelHeader = ({
    title,
    onExit,
    actions,
    children,
}: Props) => (
    <div className="flex h-12 shrink-0 items-center justify-between px-3">
        <div className="flex min-w-0 items-center gap-1">
            <ToolbarButton
                label="Voltar"
                icon={ArrowLeftIcon}
                side="bottom"
                onClick={onExit}
            />
            <h2 className="min-w-0 truncate text-sm font-semibold">{title}</h2>
            {actions}
        </div>
        <div className="flex shrink-0 items-center gap-1">{children}</div>
    </div>
);
