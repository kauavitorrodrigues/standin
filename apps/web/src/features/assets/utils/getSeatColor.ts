import { SEAT_COLOR, SEAT_SELECTED_COLOR } from "../consts/seatEditor";

// The color of a seat on the image: the picked one stands out.
export const getSeatColor = (selected: boolean): string => {
    if (selected) return SEAT_SELECTED_COLOR;
    return SEAT_COLOR;
};
