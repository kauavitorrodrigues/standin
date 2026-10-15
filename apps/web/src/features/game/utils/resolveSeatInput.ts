type SeatInput = { isSitting: boolean; isMoving: boolean; released: boolean };

// Standing up is a new press of a movement key. An avatar sat down while the
// key was still held would otherwise stand back up on the next frame, so the
// keys have to be let go once after sitting before they can stand it up.
export const resolveSeatInput = ({
    isSitting,
    isMoving,
    released,
}: SeatInput): { standUp: boolean; released: boolean } => {
    if (!isSitting) return { standUp: false, released: false };
    if (!isMoving) return { standUp: false, released: true };
    return { standUp: released, released };
};
