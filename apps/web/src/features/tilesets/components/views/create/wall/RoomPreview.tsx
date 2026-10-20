import { AVATAR } from "@standin/contracts";
import { GhostSprite } from "@/features/avatar/components/views/GhostSprite";
import { WALL_SHEET_ORDER } from "../../../../consts/wallStyle";
import type { WallFileEntry } from "../../../../types/wallStyleForm";
import {
    WALL_PREVIEW_HEIGHT,
    WALL_PREVIEW_WIDTH,
    getFloorBox,
} from "../../../../utils/wallStyle/getPreviewLayout";
import { isStripCandidate } from "../../../../utils/wallStyle/placeEntries";
import type { WallPiece } from "@standin/contracts";
import { WallPreviewPiece } from "./PreviewPiece";

type Props = {
    entries: readonly WallFileEntry[];
    disabled: boolean;
    onPick: (piece: WallPiece, file: File | null) => void;
};

const getFileOf = (
    entries: readonly WallFileEntry[],
    piece: WallPiece
): File | null => entries.find((entry) => entry.piece === piece)?.file ?? null;

// A room built out of the pieces the user sent, so the style is seen as it will
// look on a map, with an avatar inside for scale. Each place of the outline
// takes the file of its piece when clicked, and what is still missing is a
// dashed place with its name.
export const WallRoomPreview = ({ entries, disabled, onPick }: Props) => {
    const strip = isStripCandidate(entries) ? entries[0].file : null;
    const floor = getFloorBox();

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-muted/30 flex flex-col items-center gap-3 rounded-xl border p-6">
                <div
                    className="relative max-w-full"
                    style={{
                        width: WALL_PREVIEW_WIDTH,
                        height: WALL_PREVIEW_HEIGHT,
                    }}
                >
                    <div
                        className="absolute bg-emerald-900/30"
                        style={floor}
                        aria-hidden
                    />
                    <GhostSprite
                        x={floor.left + floor.width / 2}
                        feetY={
                            floor.top + floor.height / 2 + AVATAR.visible.h / 2
                        }
                    />
                    {WALL_SHEET_ORDER.map((piece) => (
                        <WallPreviewPiece
                            key={piece}
                            piece={piece}
                            file={getFileOf(entries, piece)}
                            strip={strip}
                            disabled={disabled}
                            onPick={onPick}
                        />
                    ))}
                </div>
                <p className="text-muted-foreground text-xs">
                    Clique em uma posição para trocar o PNG dela.
                </p>
            </div>
        </div>
    );
};
