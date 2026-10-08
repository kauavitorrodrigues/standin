import { STAGE_OVERFLOW_LABELS } from "../../consts/stage";

type OverflowTileProps = {
    hiddenCount: number;
    onOpen: () => void;
};

export const OverflowTile = ({ hiddenCount, onOpen }: OverflowTileProps) => (
    <button
        type="button"
        aria-label={STAGE_OVERFLOW_LABELS.open}
        onClick={onOpen}
        className="pointer-events-auto flex aspect-video h-24 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-neutral-800 text-lg font-medium text-white shadow-lg ring-1 ring-white/10"
    >
        +{hiddenCount}
    </button>
);
