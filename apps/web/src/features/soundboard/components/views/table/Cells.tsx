import type { SoundboardClip } from "@standin/contracts";
import { formatClock } from "../../../utils/formatClock";
import { formatShortDate } from "../../../utils/formatShortDate";
import { volumeToPercent } from "../../../utils/volumeToPercent";
import { ClipTileIcon } from "../tile/TileIcon";

type Props = { clip: SoundboardClip };

const MUTED = "truncate text-sm text-muted-foreground tabular-nums";

export const NameCell = ({ clip }: Props) => (
    <span className="flex min-w-0 items-center gap-2">
        <ClipTileIcon icon={clip.icon} />
        <span className="truncate text-sm font-medium" title={clip.name}>
            {clip.name}
        </span>
    </span>
);

export const DurationCell = ({ clip }: Props) => (
    <span className={MUTED}>{formatClock(clip.durationMs)}</span>
);

export const VolumeCell = ({ clip }: Props) => (
    <span className={MUTED}>{volumeToPercent(clip.volume)}%</span>
);

export const UploaderCell = ({ clip }: Props) => (
    <span className={MUTED} title={clip.createdByName}>
        {clip.createdByName}
    </span>
);

export const DateCell = ({ clip }: Props) => (
    <span className={MUTED}>{formatShortDate(clip.updatedAt)}</span>
);
