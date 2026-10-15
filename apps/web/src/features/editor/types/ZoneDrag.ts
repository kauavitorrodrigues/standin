import type { Cell, Zone } from "@standin/contracts";
import type { ZoneHandle } from "@/features/editor/types/zone-handle";
import type { ZoneRect } from "@/features/editor/types/zone-rect";

// A zone being dragged: its body (move) or one of its handles (resize). `rect`
// is where the zone was when the press started.
export type ZoneDrag =
    | { mode: "move"; zone: Zone; rect: ZoneRect; from: Cell }
    | { mode: "resize"; zone: Zone; rect: ZoneRect; handle: ZoneHandle };
