import { Button } from "@/components/ui/button";
import { WALK_MESSAGES } from "@/features/game/consts/walk-messages";

type WalkToPersonChipProps = {
    // The name of the selected person, or null with none selected.
    name: string | null;
    onWalk: () => void;
};

// The action over a person whose avatar was clicked: walk to them. It takes
// the place of the walk chip, at the same spot, and goes away with the
// selection.
export const WalkToPersonChip = ({ name, onWalk }: WalkToPersonChipProps) => {
    if (name === null) return null;

    return (
        <div className="pointer-events-none absolute right-0 bottom-20 left-(--rail-width) z-30 flex justify-center px-4">
            <div className="pointer-events-auto flex animate-in items-center rounded-xl bg-muted p-1 duration-300 ease-out fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none ring-1 ring-foreground/10">
                <Button type="button" onClick={onWalk}>
                    {WALK_MESSAGES.walkToPerson(name)}
                </Button>
            </div>
        </div>
    );
};
