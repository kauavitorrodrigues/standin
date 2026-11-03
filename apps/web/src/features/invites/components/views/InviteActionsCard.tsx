import type { ReactNode } from "react";
import { SendIcon } from "lucide-react";

type Props = {
    title: string;
    description: string;
    // The buttons, shown side by side under the text.
    children: ReactNode;
};

// A card that offers other ways to invite, with the actions side by side.
export const InviteActionsCard = ({ title, description, children }: Props) => (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex items-start gap-3">
            <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                <SendIcon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-sm leading-snug font-medium">{title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
);
