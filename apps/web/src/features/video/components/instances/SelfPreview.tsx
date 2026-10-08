import { useState } from "react";
import { VideoIcon } from "lucide-react";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SELF_PREVIEW_LABELS } from "../../consts/stage";
import { VideoElement } from "../views/VideoElement";

type SelfPreviewProps = {
    userId: string;
    name: string;
    stream: MediaStream | null;
};

const TILE_CLASSES =
    "flex aspect-video h-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted ring-1 ring-white/10";

// Compact "this is how you look" tile for the bottom bar. It shows the live
// camera when there is one and the user's avatar otherwise, so the slot next
// to the camera toggle is never empty or confusing. Only the live camera is
// interactive: clicking it opens a larger preview centered on the screen.
// The avatar has nothing to enlarge, so it stays inert.
export const SelfPreview = ({ userId, name, stream }: SelfPreviewProps) =>
    stream ? (
        <LivePreview stream={stream} />
    ) : (
        <div className={TILE_CLASSES}>
            <UserAvatar id={userId} name={name} size="sm" />
        </div>
    );

// The open state belongs here, not to SelfPreview: when the stream goes away
// (the camera is turned off, or someone comes near and the preview falls back
// to the avatar) this unmounts and takes the state with it, so the dialog
// cannot pop back open by itself when the camera returns.
const LivePreview = ({ stream }: { stream: MediaStream }) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                aria-label={SELF_PREVIEW_LABELS.open}
                className={`${TILE_CLASSES} cursor-pointer`}
            >
                {/* While the large preview is open the tile stops rendering
                    the same stream a second time. */}
                {open ? (
                    <VideoIcon className="size-4 text-muted-foreground" />
                ) : (
                    <VideoElement
                        stream={stream}
                        mirrored
                        className="object-cover"
                    />
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{SELF_PREVIEW_LABELS.title}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <VideoElement stream={stream} mirrored />
                </div>
            </DialogContent>
        </Dialog>
    );
};
