import type { AreaGhostTarget } from "@/features/editor/types/AreaGhostTarget";

// The area ghost as the area placement controller sees it. The Phaser class
// implements it and the tests use a fake.
export type AreaGhostView = {
    show: (target: AreaGhostTarget) => void;
    hide: () => void;
    destroy: () => void;
};
