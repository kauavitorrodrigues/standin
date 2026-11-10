import { CircleCheckIcon, CircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AppStatus } from "@/features/integrations/types/app";

type Props = {
    status: AppStatus;
};

// The connection state of an app: green when connected, quiet when not.
export const AppStatusBadge = ({ status }: Props) => {
    if (status.isConnected) {
        return (
            <Badge variant="success">
                <CircleCheckIcon />
                {status.label}
            </Badge>
        );
    }

    return (
        <Badge variant="secondary">
            <CircleIcon />
            {status.label}
        </Badge>
    );
};
