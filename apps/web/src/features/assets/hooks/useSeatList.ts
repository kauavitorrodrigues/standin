import { useWatch, type UseFormReturn } from "react-hook-form";
import type { AddVariantFormValues } from "../types/addVariantForm";
import type { Seat, SeatFacing } from "../types/seat";
import { withFacing, withoutSeat } from "../utils/seatList";

type Params = {
    form: UseFormReturn<AddVariantFormValues>;
    onSelect: (index: number | null) => void;
};

// The seats marked on the image, and what the list can do to them: choose
// where one faces, or drop it.
export const useSeatList = ({ form, onSelect }: Params) => {
    const seats = useWatch({ control: form.control, name: "seats" });

    const update = (next: Seat[]) => {
        form.setValue("seats", next);
        form.clearErrors("seats");
    };

    const setFacing = (index: number, facing: SeatFacing) => {
        update(withFacing(seats, index, facing));
    };

    const remove = (index: number) => {
        update(withoutSeat(seats, index));
        onSelect(null);
    };

    return { seats, setFacing, remove };
};
