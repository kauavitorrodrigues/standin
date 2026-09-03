import type { ReactNode } from "react";
import { BackButton } from "@/features/chat/components/layout/BackButton";

type Props = {
    title: string;
    onBack?: () => void;
    children: ReactNode;
};

// Pulled out to the sidebar padding edge so the divider spans the full panel
// width instead of stopping at the content inset.
export const HeaderShell = ({ title, onBack, children }: Props) => {
    return (
        <div className="-mx-4 flex shrink-0 items-center gap-2 border-b border-border px-4 pb-3">
            <BackButton onClick={onBack} />
            <span className="flex-1 truncate text-lg font-semibold">
                {title}
            </span>
            <div className="flex items-center">{children}</div>
        </div>
    );
};
