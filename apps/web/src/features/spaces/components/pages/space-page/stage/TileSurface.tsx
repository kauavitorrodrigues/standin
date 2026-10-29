import { VideoIcon, VideoOffIcon } from "lucide-react";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { useProfilePictureOf } from "@/features/users/hooks/useProfilePictureOf";
import type { StageTile } from "@/features/spaces/types/stage";
import { useMirrorSelfCameraPreference } from "@/features/media-devices/hooks/useMirrorSelfCameraPreference";
import { VideoElement } from "@/components/VideoElement";
import { getPauseNotice } from "@/features/spaces/utils/getPauseNotice";

type TileSurfaceProps = {
    tile: StageTile;
    // The same stream is already on screen somewhere larger (the enlarged
    // tile), so this one holds a placeholder instead of rendering it twice.
    isVideoPaused?: boolean;
};

// What fills a tile: the live video, or the person's avatar when they are
// nearby without a camera. A video that is not playing, because the server
// holds it back or the viewer hid it, says why instead of showing a frozen
// picture.
export const TileSurface = ({ tile, isVideoPaused = false }: TileSurfaceProps) => {
    const mirrorSelfCamera = useMirrorSelfCameraPreference();
    const picture = useProfilePictureOf(tile.userId);

    if (tile.notice) {
        const notice = getPauseNotice(tile.notice);

        return (
            <div
                role="status"
                aria-label={notice.full}
                title={notice.full}
                className="flex size-full flex-col items-center justify-center gap-1 bg-neutral-800 px-2 text-center text-neutral-300"
            >
                {tile.stream ? (
                    <VideoOffIcon className="size-5" />
                ) : (
                    <UserAvatar
                        id={tile.userId ?? tile.id}
                        name={tile.label}
                        avatar={picture}
                        size="sm"
                    />
                )}
                <span className="text-[10px] leading-tight">{notice.short}</span>
            </div>
        );
    }

    if (tile.stream && isVideoPaused) {
        return (
            <div className="flex size-full items-center justify-center bg-neutral-800 text-neutral-400">
                <VideoIcon className="size-5" />
            </div>
        );
    }

    if (tile.stream) {
        return (
            <VideoElement
                stream={tile.stream}
                mirrored={
                    mirrorSelfCamera && tile.isSelf && tile.slot === "camera"
                }
                className={tile.slot === "camera" ? "object-cover" : undefined}
            />
        );
    }

    return (
        <div className="flex size-full items-center justify-center bg-neutral-800">
            <UserAvatar
                id={tile.userId ?? tile.id}
                name={tile.label}
                avatar={picture}
                size="sm"
            />
        </div>
    );
};
