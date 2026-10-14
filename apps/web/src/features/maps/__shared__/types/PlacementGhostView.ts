import type { PlacementGhostTarget } from "@/features/maps/__shared__/types/PlacementGhostTarget";

// The ghost as the placement controller sees it. The Phaser class implements
// it and the tests use a fake.
export type PlacementGhostView = {
    show: (target: PlacementGhostTarget) => void;
    hide: () => void;
    destroy: () => void;
};
