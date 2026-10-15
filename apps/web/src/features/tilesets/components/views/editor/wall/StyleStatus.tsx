import { validateWallStyle, type WallStyle } from "@standin/contracts";
import { WALL_PIECE_LABELS } from "../../../../consts/wall";

type Props = { style: WallStyle | undefined };

// What the style of the selected wall still lacks to be saved. Nothing is
// shown for a style that is complete or when the tile has none.
export const WallStyleStatus = ({ style }: Props) => {
    if (!style) return null;
    const report = validateWallStyle(style);
    if (report.isComplete) return null;

    return (
        <p className="text-muted-foreground text-xs">
            Faltam no estilo {report.name}:{" "}
            {report.missing.map((piece) => WALL_PIECE_LABELS[piece]).join(", ")}
            .
        </p>
    );
};
