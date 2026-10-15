import {
    BoxIcon,
    FrameIcon,
    Grid3x3Icon,
    MapIcon,
    MoveHorizontalIcon,
    TagsIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { IMAGE_COLOR, NAME_COLOR } from "@/features/assets/consts/editorColors";
import type { ExtractedGroup } from "@/features/assets/types/extractedInfo";
import type { TileSheetGrid } from "../../../types/sheet";
import { ExtractedInfo } from "@/features/assets/components/views/upload/ExtractedInfo";

type Props = {
    tileset: Pick<LibraryTilesetDetail, "inUse" | "margin" | "spacing">;
    // What the row of the grid shows: its text, or the button that picks how
    // the image divides.
    gridValue: ReactNode;
    grid: TileSheetGrid;
    // How many tiles have a category, as the editor has them right now.
    taggedCount: number;
};

// What helps to edit the tileset: how its sheet is divided (the grid, and the
// margin and the spacing, each in its own row so none wraps, only while
// they cannot be edited, because then the grid has them), how much of it is already marked, and whether maps paint with it
// (which locks its tiles).
export const TilesetInfo = ({
    tileset,
    gridValue,
    grid,
    taggedCount,
}: Props) => {
    const groups: ExtractedGroup[] = [
        {
            rows: [
                {
                    label: "Grade",
                    value: gridValue,
                    icon: Grid3x3Icon,
                    color: IMAGE_COLOR,
                },
                {
                    label: "Margem",
                    value: `${tileset.margin} px`,
                    icon: FrameIcon,
                    color: IMAGE_COLOR,
                    show: tileset.inUse,
                },
                {
                    label: "Espaçamento",
                    value: `${tileset.spacing} px`,
                    icon: MoveHorizontalIcon,
                    color: IMAGE_COLOR,
                    show: tileset.inUse,
                },
                {
                    label: "Categorizado",
                    value: `${taggedCount} de ${grid.tileCount}`,
                    icon: TagsIcon,
                    color: NAME_COLOR,
                },
                {
                    label: "Uso",
                    value: "Mapas pintam com ele",
                    icon: MapIcon,
                    color: NAME_COLOR,
                    show: tileset.inUse,
                },
                {
                    label: "Uso",
                    value: "Nenhum mapa usa",
                    icon: BoxIcon,
                    color: NAME_COLOR,
                    show: !tileset.inUse,
                },
            ],
        },
    ];

    return <ExtractedInfo groups={groups} compact />;
};
