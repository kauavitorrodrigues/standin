import type { Cell, Zone } from "@standin/contracts";
import type { ZoneHandle } from "@/features/maps/__shared__/types/zone-handle";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";

// A zone being dragged: its body (move) or one of its handles (resize). `rect`
// is where the zone was when the press started.
export type ZoneDrag =
    | { mode: "move"; zone: Zone; rect: ZoneRect; from: Cell }
    | { mode: "resize"; zone: Zone; rect: ZoneRect; handle: ZoneHandle };
