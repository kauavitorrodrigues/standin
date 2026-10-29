import { Button } from "@/components/ui/button";

type WalkChipProps = {
    isWalking: boolean;
    // Where the avatar is going, as the chip says it.
    text: string;
    onCancel: () => void;
};

// Tells where the avatar is walking to (a tile of a double click, its desk, a
// person), and cancels the walk. It rises from below when the walk starts. It
// sits over the control bar at the bottom of the space, centered on it.
export const WalkChip = ({ isWalking, text, onCancel }: WalkChipProps) => {
    if (!isWalking) return null;

    return (
        <div
            role="status"
            className="pointer-events-none absolute right-0 bottom-20 left-(--rail-width) z-30 flex justify-center px-4"
        >
            <div className="pointer-events-auto flex animate-in items-center gap-2.5 duration-300 ease-out fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none rounded-xl bg-muted py-1 pr-1 pl-3 text-xs font-semibold text-foreground ring-1 ring-foreground/10">
                {text}
                <Button type="button" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </div>
    );
};
