import type { ScreenRect } from "@/features/editor/types/screen-rect";

// The scene asks for the name of the area just drawn. `anchor` is where the
// area is on the screen, so the field opens over it.
export type ZoneNameRequest = {
    anchor: ScreenRect;
};
