import type { ZoneRect } from "@/features/editor/types/zone-rect";

// The picture of an area that follows the pointer while the area is dragged,
// as the zone drag sees it. The Phaser class implements it and the tests use
// a fake.
export type ZoneMoveGhostView = {
    // Starts getting the picture of the area at `rect`. Nothing shows until
    // it arrives.
    prepare: (rect: ZoneRect, snapshot: Promise<Blob>) => void;
    show: (rect: ZoneRect) => void;
    // Drops the picture and everything it holds.
    release: () => void;
};
