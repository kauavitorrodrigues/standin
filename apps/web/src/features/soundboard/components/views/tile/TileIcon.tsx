import { Volume2Icon } from "lucide-react";

type Props = { icon: string | null };

const FRAME =
    "flex size-6 shrink-0 items-center justify-center text-base text-muted-foreground";

// The icon of the clip, or a speaker when it has none.
export const ClipTileIcon = ({ icon }: Props) => {
    if (icon === null) {
        return (
            <span className={FRAME} aria-hidden>
                <Volume2Icon className="size-4" />
            </span>
        );
    }

    return (
        <span className={FRAME} aria-hidden>
            {icon}
        </span>
    );
};
