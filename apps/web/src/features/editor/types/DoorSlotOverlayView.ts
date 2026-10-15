import type { DoorSlot } from "@standin/contracts";

// The markers on the gaps of the walls as the placement controller sees them.
// The Phaser class implements it and the tests use a fake.
export type DoorSlotOverlayView = {
    show: (slots: readonly DoorSlot[]) => void;
    hide: () => void;
    destroy: () => void;
};
