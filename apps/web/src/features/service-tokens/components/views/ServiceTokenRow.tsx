import type { ServiceToken } from "@standin/contracts";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatExpiry, formatLastUsed } from "../../utils/formatTokenDate";
import { getTokenStatus } from "../../utils/getTokenStatus";
import { ServiceTokenActions } from "../instances/ServiceTokenActions";
import { ScopeBadges } from "./ScopeBadges";
import { ServiceTokenStatusBadge } from "./ServiceTokenStatusBadge";
import { TokenPrefix } from "./TokenPrefix";

type Props = { serviceToken: ServiceToken; now?: Date };

export const ServiceTokenRow = ({ serviceToken, now }: Props) => (
    <TableRow>
        <TableCell className="max-w-56 truncate font-medium">
            {serviceToken.name}
        </TableCell>
        <TableCell>
            <TokenPrefix prefix={serviceToken.tokenPrefix} />
        </TableCell>
        <TableCell>
            <ScopeBadges scopes={serviceToken.scopes} />
        </TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatLastUsed(serviceToken.lastUsedAt)}
        </TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatExpiry(serviceToken.expiresAt)}
        </TableCell>
        <TableCell>
            <ServiceTokenStatusBadge
                status={getTokenStatus(serviceToken, now)}
            />
        </TableCell>
        <TableCell className="text-right">
            <ServiceTokenActions serviceToken={serviceToken} now={now} />
        </TableCell>
    </TableRow>
);
