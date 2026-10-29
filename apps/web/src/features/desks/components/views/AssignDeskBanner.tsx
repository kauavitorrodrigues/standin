import { Button } from "@/components/ui/button";
import { DESK_MESSAGES } from "../../consts/messages";

type AssignDeskBannerProps = {
    // The name of the person who gets the desk, or null while nobody is being
    // given one.
    name: string | null;
    onCancel: () => void;
};

// Tells the owner to click a free desk on the map for the person, and cancels
// the choice. It sits at the same spot as the walk chip.
export const AssignDeskBanner = ({ name, onCancel }: AssignDeskBannerProps) => {
    if (name === null) return null;

    return (
        <div
            role="status"
            className="pointer-events-none absolute right-0 bottom-20 left-(--rail-width) z-30 flex justify-center px-4"
        >
            <div className="pointer-events-auto flex animate-in items-center gap-2.5 rounded-xl bg-muted py-1 pr-1 pl-3 text-xs font-semibold text-foreground ring-1 ring-foreground/10 duration-300 ease-out fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none">
                {DESK_MESSAGES.pickDesk(name)}
                <Button type="button" onClick={onCancel}>
                    {DESK_MESSAGES.CANCEL}
                </Button>
            </div>
        </div>
    );
};
