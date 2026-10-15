import { useWallPanel } from "../../../hooks/editor/useWallPanel";
import { WallStyleField } from "../../fields/WallStyleField";
import { WallPieceGrid } from "../../views/editor/wall/PieceGrid";
import { WallStyleList } from "../../views/editor/wall/StyleList";
import { WallPreview } from "../../views/editor/wall/Preview";
import { WallStyleStatus } from "../../views/editor/wall/StyleStatus";
import { WallTileSections } from "../../views/editor/wall/TileSections";

// What a wall tile says about itself: its style, the side of the room it
// draws, the cells that block and how far it covers an avatar behind it. It
// shows when a wall is selected, and the style and the side go to every wall
// selected. The cells and the overlap need the tile in front, so one wall.
export const TileWallPanel = () => {
    const panel = useWallPanel();
    if (panel.walls.length === 0) return null;

    const own = panel.styles.find(({ name }) => name === panel.style);

    return (
        <section className="border-border flex flex-col gap-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Parede</h3>
            <WallStyleField
                style={panel.style}
                disabled={!panel.editable}
                onCommit={panel.wall.setStyle}
            />
            <WallStyleList
                styles={panel.styles}
                active={panel.style}
                disabled={!panel.editable}
                onPick={panel.wall.setStyle}
            />
            <WallPieceGrid
                active={panel.piece}
                disabled={!panel.editable}
                onPick={panel.pickPiece}
            />
            <WallStyleStatus style={own} />
            <WallSingleTile panel={panel} />
            <WallStylePreview panel={panel} style={own} />
        </section>
    );
};

type SingleProps = { panel: ReturnType<typeof useWallPanel> };

const WallSingleTile = ({ panel }: SingleProps) => {
    if (panel.single === null || !panel.entry) return null;

    return (
        <WallTileSections
            url={panel.url}
            grid={panel.grid}
            meta={panel.meta}
            index={panel.single}
            entry={panel.entry}
            disabled={!panel.editable}
            onClearCollision={panel.wall.clearCollision}
            onClearOverlap={() => panel.wall.setOverlap(null)}
        />
    );
};

type PreviewProps = SingleProps & {
    style: ReturnType<typeof useWallPanel>["styles"][number] | undefined;
};

const WallStylePreview = ({ panel, style }: PreviewProps) => {
    if (!style) return null;

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Prévia da sala</span>
            <WallPreview
                url={panel.url}
                grid={panel.grid}
                meta={panel.meta}
                style={style}
            />
        </div>
    );
};
