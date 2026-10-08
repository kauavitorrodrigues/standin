import { VideoIcon } from "lucide-react";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import type { StageTile } from "../../types/stage";
import { VideoElement } from "./VideoElement";

type TileSurfaceProps = {
    tile: StageTile;
    // The same stream is already on screen somewhere larger (the enlarged
    // tile), so this one holds a placeholder instead of rendering it twice.
    isVideoPaused?: boolean;
};

// What fills a tile: the live video, or the person's avatar when they are
// nearby without a camera.
export const TileSurface = ({ tile, isVideoPaused = false }: TileSurfaceProps) => {
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
                mirrored={tile.isSelf && tile.slot === "camera"}
                className={tile.slot === "camera" ? "object-cover" : undefined}
            />
        );
    }

    return (
        <div className="flex size-full items-center justify-center bg-neutral-800">
            <UserAvatar
                id={tile.userId ?? tile.id}
                name={tile.label}
                size="lg"
            />
        </div>
    );
};
