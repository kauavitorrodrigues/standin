import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import type { ServiceTokenScope } from "@standin/contracts";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SERVICE_TOKEN_SCOPES_TEXT } from "../../consts/messages";
import { SERVICE_TOKEN_SCOPE_META } from "../../consts/scopes";
import { toggleScope } from "../../utils/toggleScope";

type Props = {
    value: readonly ServiceTokenScope[];
    onChange: (scopes: ServiceTokenScope[]) => void;
    disabled?: boolean;
};

// One row per resource, drawn from the scope data. The whole row toggles the
// permission; the checkbox is the keyboard and screen reader way to do it.
export const ScopesTable = ({ value, onChange, disabled }: Props) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{SERVICE_TOKEN_SCOPES_TEXT.RESOURCE}</TableHead>
                <TableHead className="w-24">
                    {SERVICE_TOKEN_SCOPES_TEXT.PERMISSION}
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {SERVICE_TOKEN_SCOPES.map((scope) => {
                const {
                    icon: Icon,
                    label,
                    description,
                } = SERVICE_TOKEN_SCOPE_META[scope];
                const toggle = () => {
                    if (disabled) return;
                    onChange(toggleScope(value, scope));
                };

                return (
                    <TableRow
                        key={scope}
                        className={disabled ? undefined : "cursor-pointer"}
                        onClick={toggle}
                    >
                        <TableCell>
                            <div className="flex items-start gap-2.5">
                                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="font-medium">{label}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {description}
                                    </span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Checkbox
                                aria-label={SERVICE_TOKEN_SCOPES_TEXT.rowLabel(
                                    label
                                )}
                                checked={value.includes(scope)}
                                disabled={disabled}
                                // The row already toggles, so a click on the
                                // box must not toggle twice.
                                onClick={(event) => event.stopPropagation()}
                                onCheckedChange={toggle}
                            />
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    </Table>
);
