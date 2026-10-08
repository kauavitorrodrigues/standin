import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acquireGameInputLock } from "@/features/game/utils/inputLock";
import { isEditableElement } from "@/features/game/utils/player";
import { cn } from "@/lib/utils";
import { useSidebarInsetClass } from "../../hooks/useSidebarInsetClass";
import { STAGE_OVERFLOW_LABELS } from "../../consts/stage";
import type { StageTile } from "../../types/stage";
import { AutoFitGrid } from "./AutoFitGrid";
import { VideoTile } from "./VideoTile";

type AllTilesViewProps = {
    tiles: StageTile[];
    onClose: () => void;
};

// Every camera and screen at once, covering only the game area: the sidebar
// (chat) and the bottom bar stay usable next to it. With a screen share, or after
// picking a tile, that tile takes the main area and the rest sit in a strip
// below it; otherwise everyone shares an even grid.
export const AllTilesView = ({ tiles, onClose }: AllTilesViewProps) => {
    const sidebarInsetClass = useSidebarInsetClass();
    // `undefined` means "nothing chosen yet", which defaults to the first
    // screen. `null` is the viewer explicitly asking for the plain grid.
    const [chosenId, setChosenId] = useState<string | null | undefined>(
        undefined
    );

    const featured =
        chosenId === undefined
            ? tiles.find((tile) => tile.slot === "screen")
            : tiles.find((tile) => tile.id === chosenId);
    const others = tiles.filter((tile) => tile.id !== featured?.id);

    // The view covers the game, so the character must not walk around behind
    // it. The chat and the rest of the page stay usable.
    useEffect(() => acquireGameInputLock(), []);

    // Keyboard users land on the close button, and focus goes back to where
    // it was when the view closes, if that element is still around (the
    // button that opened it is not: the strip unmounts while this is open).
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const previouslyFocused = document.activeElement;
        closeButtonRef.current?.focus({ preventScroll: true });

        return () => {
            if (
                previouslyFocused instanceof HTMLElement &&
                previouslyFocused.isConnected
            ) {
                previouslyFocused.focus({ preventScroll: true });
            }
        };
    }, []);

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
        <div
            role="dialog"
            aria-label={STAGE_OVERFLOW_LABELS.title}
            className={cn(
                "absolute bottom-0 left-0 top-0 z-20 flex flex-col gap-3 overflow-hidden bg-neutral-950/95 p-4",
                sidebarInsetClass
            )}
        >
            <div className="flex items-center justify-end">
                <Button
                    ref={closeButtonRef}
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    aria-label={STAGE_OVERFLOW_LABELS.close}
                    onClick={onClose}
                >
                    <XIcon />
                </Button>
            </div>

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
                                        onSelect={() => setChosenId(tile.id)}
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
    );
};
