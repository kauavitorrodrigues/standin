import { Badge } from "@/components/ui/badge";
import { SERVICE_TOKEN_STATUS_LABELS } from "../../consts/messages";
import type { ServiceTokenStatus } from "../../types";

type Props = { status: ServiceTokenStatus };

const STATUS_VARIANTS = {
    active: "success",
    expired: "warning",
    revoked: "destructive",
} as const;

export const ServiceTokenStatusBadge = ({ status }: Props) => (
    <Badge data-status={status} variant={STATUS_VARIANTS[status]}>
        {SERVICE_TOKEN_STATUS_LABELS[status]}
    </Badge>
);
