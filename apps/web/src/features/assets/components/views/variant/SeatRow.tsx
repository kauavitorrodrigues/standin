import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SEAT_FACING_META } from "../../../consts/seatFacingMeta";
import type { Seat, SeatFacing } from "../../../types/seat";
import { getToggleVariant } from "../../../utils/getToggleVariant";

type Props = {
    seat: Seat;
    index: number;
    selected: boolean;
    disabled: boolean;
    onSelect: () => void;
    onFacing: (facing: SeatFacing) => void;
    onRemove: () => void;
};

// One seat of the list: its number, the four directions it can face and a
// button to drop it.
export const SeatRow = ({
    seat,
    index,
    selected,
    disabled,
    onSelect,
    onFacing,
    onRemove,
}: Props) => (
    <li
        className={cn(
            "flex items-center justify-between gap-2 rounded-lg border p-2",
            selected && "border-primary"
        )}
        onClick={onSelect}
    >
        <span className="text-sm font-medium">Assento {index + 1}</span>
        <div className="flex items-center gap-1">
            {SEAT_FACING_META.map(({ value, label, icon: Icon }) => (
                <Button
                    key={value}
                    type="button"
                    size="icon-sm"
                    variant={getToggleVariant(seat.facing === value)}
                    aria-label={`Virado para ${label}`}
                    title={`Virado para ${label}`}
                    disabled={disabled}
                    onClick={() => onFacing(value)}
                >
                    <Icon />
                </Button>
            ))}
            <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Remover assento"
                title="Remover assento"
                disabled={disabled}
                onClick={onRemove}
            >
                <Trash2Icon />
            </Button>
        </div>
    </li>
);
