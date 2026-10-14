import { Button } from "@/components/ui/button";
import type { DeskCardAction } from "../../types/deskCard";
import { resolveDeskCardIcon } from "../../utils/resolveDeskCardIcon";
import { resolveDeskCardText } from "../../utils/resolveDeskCardText";

type DeskCardButtonProps = {
    action: DeskCardAction;
    disabled: boolean;
    onClick: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
};

export const DeskCardButton = ({
    action,
    disabled,
    onClick,
    onPointerEnter,
    onPointerLeave,
}: DeskCardButtonProps) => (
    <Button
        type="button"
        size="sm"
        icon={resolveDeskCardIcon(action)}
        disabled={disabled}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className="pointer-events-auto rounded-lg bg-black/85 font-semibold text-white shadow-md hover:bg-black"
    >
        {resolveDeskCardText(action)}
    </Button>
);
