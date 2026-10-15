import { useRef, type PointerEvent } from "react";
import { DEFAULT_SEAT_FACING } from "../consts/seatFacingMeta";
import { SEAT_HIT_RADIUS_PX } from "../consts/seatEditor";
import type { Seat } from "../types/seat";
import type { Crop } from "../types/spriteGeometry";
import { findSeatAt, getSeatOffsets } from "../utils/seatGeometry";

type Params = {
    seats: Seat[];
    frame: Crop;
    zoom: number;
    onChange: (seats: Seat[]) => void;
    // The seat picked up, kept by the form so the list can show it too.
    selected: number | null;
    onSelect: (index: number | null) => void;
};

// What a pointer does over the image in the seat editor: a click on empty
// ground marks a new seat, a click on a seat picks it up, and a drag moves
// the one picked. Seats live in the first frame of the strip.
export const useSeatMarkers = ({
    seats,
    frame,
    zoom,
    onChange,
    selected,
    onSelect,
}: Params) => {
    const dragging = useRef(false);

    const getPoint = (event: PointerEvent<HTMLElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / zoom,
            y: (event.clientY - rect.top) / zoom,
        };
    };

    const move = (index: number, point: { x: number; y: number }) => {
        const offsets = getSeatOffsets(point, frame);
        onChange(
            seats.map((seat, at) =>
                at === index ? { ...seat, ...offsets } : seat
            )
        );
    };

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = getPoint(event);
        const hit = findSeatAt(seats, point, frame, SEAT_HIT_RADIUS_PX / zoom);
        if (hit >= 0) {
            onSelect(hit);
            dragging.current = true;
            return;
        }
        if (point.x < frame.x || point.x > frame.x + frame.w) return;
        onChange([
            ...seats,
            { ...getSeatOffsets(point, frame), facing: DEFAULT_SEAT_FACING },
        ]);
        onSelect(seats.length);
        dragging.current = true;
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        if (!dragging.current || selected === null) return;
        move(selected, getPoint(event));
    };

    const onPointerUp = () => {
        dragging.current = false;
    };

    const clear = () => {
        onChange([]);
        onSelect(null);
    };

    return {
        clear,
        pointerHandlers: { onPointerDown, onPointerMove, onPointerUp },
    };
};
