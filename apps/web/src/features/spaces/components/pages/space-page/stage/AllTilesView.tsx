import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { acquireGameInputLock } from "@/features/game/utils/inputLock";
import { isEditableElement } from "@/features/game/utils/player";
import type { StageTile } from "@/features/spaces/types/stage";
import { AutoFitGrid } from "@/features/spaces/components/pages/space-page/stage/AutoFitGrid";
import { VideoTile } from "@/features/spaces/components/pages/space-page/stage/VideoTile";

type AllTilesViewProps = {
    tiles: StageTile[];
    // The tile that opens in the main area. Without one, the first screen
    // (if any) does.
    initialTileId?: string;
    isClosing: boolean;
    onClose: () => void;
};

// Every camera and screen at once, covering only the game area: the sidebar
// (chat) and the bottom bar stay usable next to it. Closed with Escape or
// from the view toggle. With a screen share, or after
// picking a tile, that tile takes the main area and the rest sit in a strip
// below it; otherwise everyone shares an even grid.
export const AllTilesView = ({
    tiles,
    initialTileId,
    isClosing,
    onClose,
}: AllTilesViewProps) => {
    // `undefined` means "nothing chosen yet", which defaults to the first
    // screen. `null` is the viewer explicitly asking for the plain grid.
    const [chosenId, setChosenId] = useState<string | null | undefined>(
        initialTileId
    );

    const featured =
        chosenId === undefined
            ? tiles.find((tile) => tile.slot === "screen")
            : tiles.find((tile) => tile.id === chosenId);
    const others = tiles.filter((tile) => tile.id !== featured?.id);

    // The view covers the game, so the character must not walk around behind
    // it. The chat and the rest of the page stay usable.
    useEffect(() => acquireGameInputLock(), []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            // Something on top (the camera preview dialog) already used it.
            if (event.key !== "Escape" || event.defaultPrevented) return;
            // Esc inside the chat input is for the input, not for this view.
            if (isEditableElement(document.activeElement)) return;
            onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
        // No opacity or filter on this element or the ones holding tiles:
        // they would turn the tiles' backdrop blur into a visible square
        // while animating. Only the background layer fades, and the content
        // just scales.
        <div
            role="dialog"
            aria-label="Participantes e transmissões"
            className="absolute top-0 right-0 bottom-0 left-(--rail-width) z-20 overflow-hidden"
        >
            <div
                aria-hidden
                className={cn(
                    "absolute inset-0 bg-neutral-950/60 duration-200 fill-mode-forwards",
                    isClosing
                        ? "animate-out fade-out-0"
                        : "animate-in fade-in-0"
                )}
            />
            <div
                className={cn(
                    "relative flex size-full flex-col gap-3 px-4 pt-4 pb-20 duration-200 fill-mode-forwards",
                    isClosing
                        ? "animate-out zoom-out-95"
                        : "animate-in zoom-in-95"
                )}
            >
                {/* Room for the view toggle, which floats above this view. */}
                <div className="h-8 shrink-0" />

                {featured ? (
                    <>
                        <div className="min-h-0 flex-1">
                            <VideoTile
                                tile={featured}
                                onSelect={() => setChosenId(null)}
                                className="aspect-auto size-full"
                            />
                        </div>
                        {others.length > 0 && (
                            // The strip never scrolls: the tiles share the row
                            // and shrink together once it is full.
                            <div className="flex shrink-0 items-center justify-center gap-2 overflow-hidden">
                                {others.map((tile) => (
                                    <div
                                        key={tile.id}
                                        className="min-w-0 max-w-44 flex-1"
                                    >
                                        <VideoTile
                                            tile={tile}
                                            onSelect={() =>
                                                setChosenId(tile.id)
                                            }
                                            className="aspect-video h-auto w-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <AutoFitGrid tiles={tiles} onSelect={setChosenId} />
                )}
            </div>
        </div>
    );
};
