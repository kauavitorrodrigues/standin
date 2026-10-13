import type { UseFormReturn } from "react-hook-form";
import { useSeatList } from "@/features/assets/hooks/useSeatList";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";
import { SeatRow } from "../../../views/variant/SeatRow";
import { SeatsCount } from "../../../views/variant/SeatsCount";
import { SeatsEmptyState } from "../../../views/variant/SeatsEmptyState";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    selected: number | null;
    onSelect: (index: number | null) => void;
    disabled: boolean;
};

// The seats marked on the image, one row each, to choose where it faces or
// to drop it. It has a fixed height and scrolls inside, so marking seats
// never makes the dialog grow.
export const SeatsList = ({ form, selected, onSelect, disabled }: Props) => {
    const { seats, setFacing, remove } = useSeatList({ form, onSelect });

    return (
        <section className="bg-muted/30 flex flex-col gap-2 rounded-lg border p-3">
            <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Assentos
                <SeatsCount count={seats.length} />
            </h4>
            <div className="h-56 overflow-y-auto">
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
