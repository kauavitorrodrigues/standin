import { cn } from "@/lib/utils";
import { useSeatList } from "@/features/assets/hooks/useSeatList";
import type { Seat } from "@/features/assets/types/seat";
import { SeatRow } from "../../views/variant/SeatRow";
import { SeatsCount } from "../../views/variant/SeatsCount";
import { SeatsEmptyState } from "../../views/variant/SeatsEmptyState";

type Props = {
    seats: Seat[];
    onChange: (seats: Seat[]) => void;
    selected: number | null;
    onSelect: (index: number | null) => void;
    disabled: boolean;
    // Takes the height of the column it is in, instead of a fixed one.
    fill?: boolean;
};

const getListSize = (fill: boolean) => {
    if (fill) return "min-h-0 flex-1";
    return "h-56";
};

// The seats marked on the image, one row each, to choose where it faces or
// to drop it. It has a fixed height and scrolls inside, so marking seats
// never makes the dialog grow.
export const SeatsList = ({
    seats,
    onChange,
    selected,
    onSelect,
    disabled,
    fill = false,
}: Props) => {
    const { setFacing, remove } = useSeatList({ seats, onChange, onSelect });

    return (
        <section
            className={cn(
                "bg-muted/30 flex flex-col gap-2 rounded-lg border p-3",
                fill && "min-h-0 flex-1"
            )}
        >
            <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Assentos
                <SeatsCount count={seats.length} />
            </h4>
            <div className={cn("overflow-y-auto", getListSize(fill))}>
                <SeatsEmptyState show={seats.length === 0} />
                <ul className="flex flex-col gap-2">
                    {seats.map((seat, index) => (
                        <SeatRow
                            key={index}
                            seat={seat}
                            index={index}
                            selected={selected === index}
                            disabled={disabled}
                            onSelect={() => onSelect(index)}
                            onFacing={(facing) => setFacing(index, facing)}
                            onRemove={() => remove(index)}
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
};
