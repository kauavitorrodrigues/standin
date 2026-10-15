import type { ZoneKind } from "@/features/editor/types/zone-kind";
import type { ScreenRect } from "@/features/editor/types/screen-rect";

// The scene asks for the name of the area or room just drawn. `anchor` is
// where it is on the screen, so the field opens over it.
export type ZoneNameRequest = {
    kind: ZoneKind;
    anchor: ScreenRect;
};
