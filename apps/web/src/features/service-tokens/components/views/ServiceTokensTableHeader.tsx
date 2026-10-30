import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SERVICE_TOKEN_TABLE_TEXT as Text } from "../../consts/messages";

export const ServiceTokensTableHeader = () => (
    <TableHeader>
        <TableRow>
            <TableHead>{Text.NAME}</TableHead>
            <TableHead>{Text.TOKEN}</TableHead>
            <TableHead>{Text.SCOPES}</TableHead>
            <TableHead>{Text.LAST_USED}</TableHead>
            <TableHead>{Text.EXPIRES}</TableHead>
            <TableHead>{Text.STATUS}</TableHead>
            <TableHead className="text-right">{Text.ACTIONS}</TableHead>
        </TableRow>
    </TableHeader>
);
