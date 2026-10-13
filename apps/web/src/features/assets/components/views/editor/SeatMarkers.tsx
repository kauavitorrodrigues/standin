import type { Seat } from "../../../types/seat";
import type { Crop } from "../../../types/spriteGeometry";
import { getSeatDrawOrder } from "../../../utils/getSeatDrawOrder";
import { getSeatPoint } from "../../../utils/seatGeometry";
import { SeatMarker } from "./SeatMarker";

type Props = {
    seats: Seat[];
    frame: Crop;
    zoom: number;
    selected: number | null;
};

// The seats over the image. It only draws, the clicks are handled by the
// canvas under it. The picked seat is drawn last, so it stays on top.
export const SeatMarkers = ({ seats, frame, zoom, selected }: Props) => (
    <>
        {getSeatDrawOrder(seats.length, selected).map((index) => {
            const seat = seats[index]!;
            const point = getSeatPoint(seat, frame);

            return (
                <SeatMarker
                    key={index}
                    seat={seat}
                    index={index}
                    x={point.x * zoom}
                    y={point.y * zoom}
                    selected={index === selected}
                />
            );
        })}
    </>
);
