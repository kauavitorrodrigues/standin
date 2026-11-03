import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

type Props = {
    icon: LucideIcon;
    title: string;
    message: string;
    children?: ReactNode;
};

// A list with nothing to show, outside the table so it can carry an action.
export const ListEmptyState = ({ icon, title, message, children }: Props) => (
    <ListResponseState
        variant="empty"
        icon={icon}
        title={title}
        message={message}
        className="rounded-lg border"
    >
        {children}
    </ListResponseState>
);
