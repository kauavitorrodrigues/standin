import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

type Props = {
    icon: LucideIcon;
    title: string;
    message: string;
    // The call to action that fills the list, such as the "Novo asset" button.
    action: ReactNode;
};

// The empty list of a library section, the same size on every one of them:
// a big icon, a short title, a few lines of text and the way out.
export const LibraryEmptyState = ({ icon, title, message, action }: Props) => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="empty"
            icon={icon}
            iconClassName="size-16"
            headerClassName="max-w-3xl"
            titleClassName="text-xl"
            descriptionClassName="text-base"
            title={title}
            message={message}
        >
            {action}
        </ListResponseState>
    </div>
);
