import { Button } from "@/components/ui/button";
import { getToggleVariant } from "@/features/assets/utils/getToggleVariant";

type Props = {
    // What the option does now, said on the button.
    label: string;
    active: boolean;
    onClick: () => void;
};

// An option of a tool that is on or off, in a `ToolOptionsPanel`.
export const ToolOptionToggle = ({ label, active, onClick }: Props) => (
    <Button
        type="button"
        size="xs"
        variant={getToggleVariant(active)}
        aria-pressed={active}
        onClick={onClick}
    >
        {label}
    </Button>
);
