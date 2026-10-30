import type { ServiceToken } from "@standin/contracts";
import { Table, TableBody } from "@/components/ui/table";
import { ServiceTokenRow } from "./ServiceTokenRow";
import { ServiceTokensTableHeader } from "./ServiceTokensTableHeader";

type Props = { serviceTokens: ServiceToken[]; now?: Date };

export const ServiceTokensTable = ({ serviceTokens, now }: Props) => (
    <Table>
        <ServiceTokensTableHeader />
        <TableBody>
            {serviceTokens.map((serviceToken) => (
                <ServiceTokenRow
                    key={serviceToken.id}
                    serviceToken={serviceToken}
                    now={now}
                />
            ))}
        </TableBody>
    </Table>
);
