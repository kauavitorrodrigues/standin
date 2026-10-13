import { ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
    // The zoom in use, where 1 is 100%.
    zoom: number;
    canZoomIn: boolean;
    canZoomOut: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    // What pressing the zoom in use does, and what the tooltip says about it.
    onReset: () => void;
    resetLabel: string;
    // The keys that do the same, as shown in the tooltips.
    zoomInShortcut?: string;
    zoomOutShortcut?: string;
    resetShortcut?: string;
};

// Zoom out, the zoom in use (press it to reset) and zoom in. It goes inside a
// floating panel.
export const ZoomControls = ({
    zoom,
    canZoomIn,
    canZoomOut,
    onZoomIn,
    onZoomOut,
    onReset,
    resetLabel,
    zoomInShortcut,
    zoomOutShortcut,
    resetShortcut,
}: Props) => (
    <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Diminuir o zoom"
                        disabled={!canZoomOut}
                        onClick={onZoomOut}
                    />
                }
            >
                <ZoomOutIcon />
            </TooltipTrigger>
            <TooltipContent side="top" shortcut={zoomOutShortcut}>
                Diminuir o zoom
            </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        aria-label={resetLabel}
                        className="w-12 tabular-nums"
                        onClick={onReset}
                    />
                }
            >
                {zoom * 100}%
            </TooltipTrigger>
            <TooltipContent side="top" shortcut={resetShortcut}>
                {resetLabel}
            </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Aumentar o zoom"
                        disabled={!canZoomIn}
                        onClick={onZoomIn}
                    />
                }
            >
                <ZoomInIcon />
            </TooltipTrigger>
            <TooltipContent side="top" shortcut={zoomInShortcut}>
                Aumentar o zoom
            </TooltipContent>
        </Tooltip>
    </div>
);
