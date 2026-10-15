import type { WallPiece } from "@standin/contracts";
import { WALL_SHEET_ORDER } from "../../../../consts/wallStyle";
import type { WallFileEntry } from "../../../../types/wallStyleForm";
import { isStripCandidate } from "../../../../utils/wallStyle/placeEntries";
import { WallPieceRow } from "./PieceRow";

type Props = {
    entries: readonly WallFileEntry[];
    disabled: boolean;
    onMove: (from: WallPiece, to: WallPiece) => void;
    onRemove: (piece: WallPiece, file: null) => void;
    // Takes out the strip, which is not tied to a single piece.
    onRemoveStrip: () => void;
};

const getFileOf = (
    entries: readonly WallFileEntry[],
    piece: WallPiece
): File | null => entries.find((entry) => entry.piece === piece)?.file ?? null;

// The eight pieces, always in the same order and with the same height, each one
// with its file or empty, so the form never grows or shrinks as files come and
// go. Files get here by the dropzone above or by clicking a place of the room.
export const WallPieceList = ({
    entries,
    disabled,
    onMove,
    onRemove,
    onRemoveStrip,
}: Props) => {
    const strip = isStripCandidate(entries) ? entries[0].file : null;

    return (
        <ul className="flex flex-col gap-1.5">
            {WALL_SHEET_ORDER.map((piece) => (
                <WallPieceRow
                    key={piece}
                    piece={piece}
                    file={getFileOf(entries, piece)}
                    strip={strip}
                    disabled={disabled}
                    onMove={(to) => onMove(piece, to)}
                    onRemove={() => onRemove(piece, null)}
                    onRemoveStrip={onRemoveStrip}
                />
            ))}
        </ul>
    );
};
