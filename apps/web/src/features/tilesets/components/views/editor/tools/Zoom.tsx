import { ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DEFAULT_TILE_ZOOM,
    TILE_ZOOMS,
    type TileZoom,
} from "../../../../consts/sheetZoom";
import { getNextTileZoom } from "../../../../utils/editor/getNextTileZoom";

type Props = {
    zoom: TileZoom;
    onZoomChange: (zoom: TileZoom) => void;
};

// Zoom out, the zoom in use (press it to go back to the default) and zoom in.
// The wheel over the sheet does the same.
export const TileZoomControls = ({ zoom, onZoomChange }: Props) => (
    <div className="flex shrink-0 items-center gap-0.5">
        <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Diminuir o zoom"
            disabled={zoom === TILE_ZOOMS[0]}
            onClick={() => onZoomChange(getNextTileZoom(zoom, -1))}
        >
            <ZoomOutIcon />
        </Button>
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        aria-label="Voltar ao zoom padrão"
                        className="w-12 tabular-nums"
                        onClick={() => onZoomChange(DEFAULT_TILE_ZOOM)}
                    />
                }
            >
                {zoom * 100}%
            </TooltipTrigger>
            <TooltipContent side="top">Voltar ao zoom padrão</TooltipContent>
        </Tooltip>
        <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Aumentar o zoom"
            disabled={zoom === TILE_ZOOMS[TILE_ZOOMS.length - 1]}
            onClick={() => onZoomChange(getNextTileZoom(zoom, 1))}
        >
            <ZoomInIcon />
        </Button>
    </div>
);
