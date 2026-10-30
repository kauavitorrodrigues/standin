import { XIcon } from "lucide-react";
import type { ServiceTokenScope } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { SERVICE_TOKEN_SCOPES_TEXT } from "../../consts/messages";
import { SERVICE_TOKEN_SCOPE_PRESETS } from "../../consts/scopePresets";
import { getActivePreset } from "../../utils/getActivePreset";

type Props = {
    value: readonly ServiceTokenScope[];
    total: number;
    onChange: (scopes: ServiceTokenScope[]) => void;
    disabled?: boolean;
};

// The counter and the shortcuts above the permissions table. The shortcut
// that matches the selection is highlighted.
export const ScopePresetBar = ({ value, total, onChange, disabled }: Props) => {
    const active = getActivePreset(value);

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span aria-live="polite">
                {SERVICE_TOKEN_SCOPES_TEXT.count(value.length, total)}
            </span>
            <div
                role="group"
                aria-label={SERVICE_TOKEN_SCOPES_TEXT.presetsLabel}
                className="flex flex-wrap items-center gap-1"
            >
                {SERVICE_TOKEN_SCOPE_PRESETS.map((preset) => (
                    <Button
                        key={preset.id}
                        type="button"
                        size="sm"
                        icon={preset.icon}
                        variant={
                            active?.id === preset.id ? "secondary" : "outline"
                        }
                        aria-pressed={active?.id === preset.id}
                        disabled={disabled}
                        onClick={() => onChange([...preset.scopes])}
                    >
                        {preset.label}
                    </Button>
                ))}
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    icon={XIcon}
                    disabled={disabled || value.length === 0}
                    onClick={() => onChange([])}
                >
                    {SERVICE_TOKEN_SCOPES_TEXT.CLEAR}
                </Button>
            </div>
        </div>
    );
};
