import { SEAT_MARKER_HALF_BOX_PX } from "../../../consts/seatEditor";
import { SEAT_MARKER_LAYOUT } from "../../../consts/seatMarkerLayout";
import type { Seat } from "../../../types/seat";
import { getSeatColor } from "../../../utils/getSeatColor";
import { SeatSelectionHalo } from "./SeatSelectionHalo";

type Props = {
    seat: Seat;
    index: number;
    // Where the seat is on the image, already scaled by the zoom, in px.
    x: number;
    y: number;
    selected: boolean;
};

const BOX_PX = SEAT_MARKER_HALF_BOX_PX * 2;

// One seat over the image: the exact point that was marked, an arrow for
// where the avatar faces, and its number in a badge on the side away from the
// arrow.
export const SeatMarker = ({ seat, index, x, y, selected }: Props) => {
    const { angle, badge } = SEAT_MARKER_LAYOUT[seat.facing];

    return (
        <svg
            width={BOX_PX}
            height={BOX_PX}
            viewBox={`${-SEAT_MARKER_HALF_BOX_PX} ${-SEAT_MARKER_HALF_BOX_PX} ${BOX_PX} ${BOX_PX}`}
            className="pointer-events-none absolute overflow-visible"
            style={{
                left: x - SEAT_MARKER_HALF_BOX_PX,
                top: y - SEAT_MARKER_HALF_BOX_PX,
                color: getSeatColor(selected),
                filter: "drop-shadow(0 0 2px rgba(0, 0, 0, 0.9))",
            }}
        >
            <SeatSelectionHalo show={selected} />
            <g transform={`rotate(${angle})`}>
                <path
                    d="M0 -19 L7 -9 L-7 -9 Z"
                    fill="currentColor"
                    stroke="#111"
                    strokeOpacity={0.6}
                    strokeWidth={1}
                    strokeLinejoin="round"
                />
            </g>
            <circle r={5} fill="currentColor" stroke="#fff" strokeWidth={2} />
            <g transform={`translate(${badge.x} ${badge.y})`}>
                <circle r={7} fill="currentColor" />
                <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={700}
                    fill="#111"
                >
                    {index + 1}
                </text>
            </g>
        </svg>
    );
};
