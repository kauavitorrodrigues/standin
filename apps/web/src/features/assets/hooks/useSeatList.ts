import type { Seat, SeatFacing } from "../types/seat";
import { withFacing, withoutSeat } from "../utils/seatList";

type Params = {
    seats: Seat[];
    onChange: (seats: Seat[]) => void;
    onSelect: (index: number | null) => void;
};

// What the list of seats can do to them: choose where one faces, or drop it.
export const useSeatList = ({ seats, onChange, onSelect }: Params) => {
    const setFacing = (index: number, facing: SeatFacing) => {
        onChange(withFacing(seats, index, facing));
    };

    const remove = (index: number) => {
        onChange(withoutSeat(seats, index));
        onSelect(null);
    };

    return { setFacing, remove };
};
