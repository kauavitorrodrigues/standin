import {
    SERVICE_TOKEN_SCOPES,
    getServiceTokenScopeAction,
    type ServiceTokenScope,
} from "@standin/contracts";
import { CircleCheckIcon, EyeIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SERVICE_TOKEN_SCOPES_TEXT as Text } from "../../consts/messages";
import { SERVICE_TOKEN_PENDING_SCOPES } from "../../consts/scopes";
import { getScopeColumns, getScopeGroups } from "../../utils/getScopeGroups";
import { getScopeMeta } from "../../utils/getScopeMeta";
import {
    getScopeCheckedState,
    getScopesOfAction,
    setScopes,
} from "../../utils/scopeSelection";

type Props = {
    value: readonly ServiceTokenScope[];
    onChange: (scopes: ServiceTokenScope[]) => void;
    disabled?: boolean;
};

const GROUPS = getScopeGroups();
const COLUMNS = getScopeColumns();
const READ_SCOPES: ServiceTokenScope[] = getScopesOfAction("read");
const SCOPES_BY_ACTION: Record<string, ServiceTokenScope[]> =
    Object.fromEntries(
        COLUMNS.map(({ action }) => [action, getScopesOfAction(action)])
    );

// The editable permissions: a row per resource, a column per action, a
// checkbox in each cell, and one for a whole row or column. The buttons above
// select a common set at once.
export const ScopesMatrix = ({ value, onChange, disabled }: Props) => {
    const toggle = (scopes: readonly ServiceTokenScope[], checked: boolean) =>
        onChange(setScopes(value, scopes, checked));

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span aria-live="polite" className="min-w-0 truncate">
                    {Text.count(value.length, SERVICE_TOKEN_SCOPES.length)}
                </span>
                {/* Kept on one line with the counter: the counter gives way first. */}
                <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={EyeIcon}
                        disabled={disabled}
                        onClick={() => onChange([...READ_SCOPES])}
                    >
                        {Text.ONLY_READ}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={CircleCheckIcon}
                        disabled={
                            disabled ||
                            value.length === SERVICE_TOKEN_SCOPES.length
                        }
                        onClick={() => onChange([...SERVICE_TOKEN_SCOPES])}
                    >
                        {Text.ALL}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={XIcon}
                        disabled={disabled || value.length === 0}
                        onClick={() => onChange([])}
                    >
                        {Text.CLEAR}
                    </Button>
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-muted/50 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium">
                                {Text.RESOURCE}
                            </th>
                            {COLUMNS.map(({ action, label }) => {
                                const scopes = SCOPES_BY_ACTION[action];
                                const state = getScopeCheckedState(
                                    value,
                                    scopes
                                );
                                return (
                                    <th
                                        key={action}
                                        className="w-28 px-3 py-2 text-left font-medium"
                                    >
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <Checkbox
                                                disabled={disabled}
                                                checked={state.checked}
                                                indeterminate={
                                                    state.indeterminate
                                                }
                                                onCheckedChange={(checked) =>
                                                    toggle(scopes, checked)
                                                }
                                            />
                                            <span aria-hidden>{label}</span>
                                            <span className="sr-only">
                                                {Text.columnLabel(label)}
                                            </span>
                                        </label>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {GROUPS.map((group) => {
                            const state = getScopeCheckedState(
                                value,
                                group.scopes
                            );
                            return (
                                <tr
                                    key={group.resource}
                                    className="border-t transition-colors hover:bg-muted/30"
                                >
                                    <td className="px-3 py-2">
                                        <label
                                            title={group.description}
                                            className="flex cursor-pointer items-center gap-2.5"
                                        >
                                            <Checkbox
                                                disabled={disabled}
                                                checked={state.checked}
                                                indeterminate={
                                                    state.indeterminate
                                                }
                                                onCheckedChange={(checked) =>
                                                    toggle(
                                                        group.scopes,
                                                        checked
                                                    )
                                                }
                                            />
                                            <group.icon className="size-4 shrink-0 text-muted-foreground" />
                                            <span
                                                aria-hidden
                                                className="font-medium"
                                            >
                                                {group.label}
                                            </span>
                                            <span className="sr-only">
                                                {Text.rowLabel(group.label)}
                                            </span>
                                        </label>
                                    </td>
                                    {COLUMNS.map(({ action }) => {
                                        const scope = group.scopes.find(
                                            (item) =>
                                                getServiceTokenScopeAction(
                                                    item
                                                ) === action
                                        );
                                        return (
                                            <td
                                                key={action}
                                                className="px-3 py-2 text-left"
                                            >
                                                <ScopeCell
                                                    scope={scope}
                                                    value={value}
                                                    disabled={disabled}
                                                    onToggle={toggle}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

type CellProps = {
    scope: ServiceTokenScope | undefined;
    value: readonly ServiceTokenScope[];
    disabled?: boolean;
    onToggle: (scopes: readonly ServiceTokenScope[], checked: boolean) => void;
};

// The checkbox of one scope, or a dash when the resource has none for the
// action. The description (with "(em breve)") names it for screen readers.
const ScopeCell = ({ scope, value, disabled, onToggle }: CellProps) => {
    if (!scope) {
        return (
            <span className="text-muted-foreground/50">{Text.EMPTY_CELL}</span>
        );
    }

    const { description } = getScopeMeta(scope);
    return (
        <span className="flex items-center gap-2">
            <Checkbox
                aria-label={description}
                title={description}
                disabled={disabled}
                checked={value.includes(scope)}
                onCheckedChange={(checked) => onToggle([scope], checked)}
            />
            {SERVICE_TOKEN_PENDING_SCOPES.includes(scope) && (
                <span aria-hidden className="text-xs text-muted-foreground">
                    {Text.PENDING_HINT}
                </span>
            )}
        </span>
    );
};
