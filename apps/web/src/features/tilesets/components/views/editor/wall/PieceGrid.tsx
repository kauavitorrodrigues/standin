import type { WallPiece } from "@standin/contracts";
import { WALL_PIECE_GRID, WALL_PIECE_LABELS } from "../../../../consts/wall";

type SlotProps = {
    piece: WallPiece | null;
    active: WallPiece | null;
    disabled: boolean;
    onPick: (piece: WallPiece) => void;
};

const PieceSlot = ({ piece, active, disabled, onPick }: SlotProps) => {
    if (piece === null) {
        return (
            <div className="border-border/60 rounded-md border border-dashed" />
        );
    }

    return (
        <button
            type="button"
            disabled={disabled}
            aria-pressed={piece === active}
            title={WALL_PIECE_LABELS[piece]}
            onClick={() => onPick(piece)}
            className="border-border bg-background hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary h-9 rounded-md border text-xs font-medium uppercase transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
            {piece}
        </button>
    );
};

type Props = {
    active: WallPiece | null;
    disabled: boolean;
    onPick: (piece: WallPiece) => void;
};

// The eight pieces of a wall style, laid out like the outline of a room seen
// from above. A click says which side of the room the tile draws, and a click
// on the piece that is already set takes it off.
export const WallPieceGrid = ({ active, disabled, onPick }: Props) => (
    <div className="grid grid-cols-3 gap-1.5">
        {WALL_PIECE_GRID.flat().map((piece, index) => (
            <PieceSlot
                key={piece ?? `center-${index}`}
                piece={piece}
                active={active}
                disabled={disabled}
                onPick={onPick}
            />
        ))}
    </div>
);
