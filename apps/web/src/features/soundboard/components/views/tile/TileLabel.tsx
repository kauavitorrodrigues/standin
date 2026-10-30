import { ClipTileIcon } from "./TileIcon";

type Props = { icon: string | null; name: string };

// The icon and the name of a clip, the name cut short when it does not fit.
// Over a hovered or focused tile it fades into the background, to leave the
// buttons in front of it readable.
export const ClipTileLabel = ({ icon, name }: Props) => (
    <span className="flex min-w-0 flex-1 items-center gap-1.5 transition-opacity group-has-[:focus-visible]/tile:opacity-20 group-hover/tile:opacity-20">
        <ClipTileIcon icon={icon} />
        <span className="min-w-0 flex-1 truncate text-left text-sm">
            {name}
        </span>
    </span>
);
