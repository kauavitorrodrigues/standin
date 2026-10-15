import type { CSSProperties } from "react";
import { TILE_SIZE, type WallPiece } from "@standin/contracts";
import { useObjectUrl } from "@/features/assets/hooks/useObjectUrl";
import { WALL_PIECE_LABELS } from "../../../../consts/wall";
import {
    WALL_PREVIEW_CELLS,
    WALL_PREVIEW_SCALE,
} from "../../../../consts/wallPreview";
import { WALL_SHEET_ORDER } from "../../../../consts/wallStyle";
import {
    getBandBox,
    getPieceBox,
} from "../../../../utils/wallStyle/getPreviewLayout";
import { getPieceHeightTiles } from "../../../../utils/wallStyle/getPieceHeightTiles";

type Props = {
    piece: WallPiece;
    // The file of this piece, when it has its own.
    file: File | null;
    // The strip that brings every piece, when there is one.
    strip: File | null;
    disabled: boolean;
    onPick: (piece: WallPiece, file: File | null) => void;
};

const SCALED_TILE = TILE_SIZE * WALL_PREVIEW_SCALE;

// The image of the piece: its own file stretched over the box, or its place on
// the strip.
const getImageStyle = (
    piece: WallPiece,
    url: string | undefined,
    hasOwnFile: boolean
): CSSProperties => {
    if (!url) return {};
    if (hasOwnFile) {
        return {
            backgroundImage: `url(${url})`,
            backgroundSize: "100% 100%",
        };
    }
    const column = WALL_SHEET_ORDER.indexOf(piece);
    const skipsCap = getPieceHeightTiles(piece) === 1;
    return {
        backgroundImage: `url(${url})`,
        backgroundSize: `${WALL_SHEET_ORDER.length * SCALED_TILE}px ${2 * SCALED_TILE}px`,
        backgroundPosition: `${-column * SCALED_TILE}px ${skipsCap ? -SCALED_TILE : 0}px`,
    };
};

// One piece in the room. With an image, every place of it shows the image and
// any of them takes a new file when clicked. Without one, the piece is a single
// dashed band named after it, as long as the wall it will fill, so the empty
// room reads as a clean frame with eight things to fill in.
export const WallPreviewPiece = ({
    piece,
    file,
    strip,
    disabled,
    onPick,
}: Props) => {
    const source = file ?? strip;
    const url = useObjectUrl(source ?? undefined);
    const label = WALL_PIECE_LABELS[piece];
    const cells = WALL_PREVIEW_CELLS.filter((cell) => cell.piece === piece);
    const onFile = (next: File | null) => onPick(piece, next);

    if (source === null) {
        return (
            <WallPreviewPlace
                label={label}
                hasImage={false}
                disabled={disabled}
                style={{ position: "absolute", ...getBandBox(cells) }}
                onFile={onFile}
            />
        );
    }

    return (
        <>
            {cells.map((cell) => (
                <WallPreviewPlace
                    key={`${cell.column}-${cell.row}`}
                    label={label}
                    hasImage
                    disabled={disabled}
                    style={{
                        position: "absolute",
                        ...getPieceBox(piece, cell),
                        ...getImageStyle(piece, url, file !== null),
                    }}
                    onFile={onFile}
                />
            ))}
        </>
    );
};

type PlaceProps = {
    label: string;
    hasImage: boolean;
    disabled: boolean;
    style: CSSProperties;
    onFile: (file: File | null) => void;
};

const WallPreviewPlace = ({
    label,
    hasImage,
    disabled,
    style,
    onFile,
}: PlaceProps) => (
    <label
        title={`${label}: escolher o PNG`}
        data-filled={hasImage}
        style={style}
        className="hover:outline-primary flex cursor-pointer items-center justify-center text-center text-[11px] leading-tight [image-rendering:pixelated] hover:outline-2 data-[filled=false]:rounded-sm data-[filled=false]:border data-[filled=false]:border-dashed data-[filled=false]:border-slate-400/70 data-[filled=false]:bg-slate-500/20 data-[filled=false]:font-medium"
    >
        <PieceName name={label} show={!hasImage} />
        <input
            type="file"
            accept="image/png"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
    </label>
);

const PieceName = ({ name, show }: { name: string; show: boolean }) => {
    if (!show) return null;

    return <span className="text-slate-300">{name}</span>;
};
