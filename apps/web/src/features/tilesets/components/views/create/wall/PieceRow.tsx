import { XIcon } from "lucide-react";
import type { WallPiece } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useObjectUrl } from "@/features/assets/hooks/useObjectUrl";
import { WALL_PIECE_LABELS } from "../../../../consts/wall";
import { WALL_SHEET_ORDER } from "../../../../consts/wallStyle";

type Props = {
    piece: WallPiece;
    // The file of this piece, when it has its own.
    file: File | null;
    // The strip that brings every piece, when there is one.
    strip: File | null;
    disabled: boolean;
    onMove: (to: WallPiece) => void;
    onRemove: () => void;
    onRemoveStrip: () => void;
};

const EMPTY = "Vazio";

const getFileName = (file: File | null, strip: File | null): string => {
    if (file) return file.name;
    if (strip) return `Tira: ${strip.name}`;
    return EMPTY;
};

const getPieceLabel = (value: WallPiece | null): string =>
    value ? WALL_PIECE_LABELS[value] : "";

// One piece of the style on a line of fixed height: the thumbnail, the name of
// the file, the piece it stands for and a button to take it out. Choosing
// another piece moves the file there, trading with the file that had it.
export const WallPieceRow = ({
    piece,
    file,
    strip,
    disabled,
    onMove,
    onRemove,
    onRemoveStrip,
}: Props) => {
    const url = useObjectUrl(file ?? undefined);
    const name = getFileName(file, strip);
    const hasFile = file !== null;

    return (
        <li
            data-empty={!hasFile && strip === null}
            className="flex h-12 min-w-0 items-center gap-2 rounded-md border p-2 data-[empty=true]:border-dashed"
        >
            <span className="flex size-8 shrink-0 items-center justify-center rounded bg-[conic-gradient(#2b2b2b_25%,#1d1d1d_0_50%,#2b2b2b_0_75%,#1d1d1d_0)] bg-[length:8px_8px]">
                <Thumb url={url} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm" title={name}>
                {name}
            </span>
            <Select
                value={piece}
                onValueChange={(next) => onMove(next as WallPiece)}
                disabled={disabled || !hasFile}
            >
                <SelectTrigger className="w-32 shrink-0">
                    <SelectValue>{getPieceLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {WALL_SHEET_ORDER.map((option) => (
                        <SelectItem key={option} value={option}>
                            {WALL_PIECE_LABELS[option]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <RemoveButton
                name={name}
                visible={hasFile || strip !== null}
                disabled={disabled}
                onClick={hasFile ? onRemove : onRemoveStrip}
            />
        </li>
    );
};

const Thumb = ({ url }: { url: string | undefined }) => {
    if (!url) return null;

    return (
        <img
            src={url}
            alt=""
            className="max-h-7 max-w-7 [image-rendering:pixelated]"
        />
    );
};

type RemoveProps = {
    name: string;
    visible: boolean;
    disabled: boolean;
    onClick: () => void;
};

// Keeps its place when hidden, so the select does not move between rows.
const RemoveButton = ({ name, visible, disabled, onClick }: RemoveProps) => (
    <Button
        type="button"
        variant="ghost"
        size="icon"
        data-visible={visible}
        className="-ml-1 shrink-0 data-[visible=false]:invisible"
        aria-label={`Remover ${name}`}
        disabled={disabled || !visible}
        onClick={onClick}
    >
        <XIcon />
    </Button>
);
