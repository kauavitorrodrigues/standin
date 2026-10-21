import { Loader2Icon } from "lucide-react";

// Dims the picture and shows a spinner while a photo is being sent or removed.
export const PendingPictureOverlay = ({
    isPending,
}: {
    isPending: boolean;
}) => {
    if (!isPending) return null;

    return (
        <div
            role="status"
            aria-label="Enviando foto"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60"
        >
            <Loader2Icon className="size-6 animate-spin" />
        </div>
    );
};
