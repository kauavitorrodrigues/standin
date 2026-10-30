// The icons over a tile, one step smaller than they were so they read as
// comfortably small. Classes are whole strings so the stylesheet finds them.
export const TILE_OVERLAY_ICON_SIZE_CLASS = "[&_svg]:size-5";

// How far the outer icons sit from the sides of the tile: the preview one from
// the left, the play one from the right.
export const TILE_OVERLAY_INSET_CLASS = "px-3";

// The look of every bare icon over a tile, the buttons and the trigger of the
// actions menu alike: no box, no padding, no border, the icon filled and
// dimmed or shrunk on hover and press. The ring is only for the keyboard.
export const TILE_ICON_BUTTON_CLASS = [
    "flex shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 leading-none text-foreground outline-none transition-[opacity,transform]",
    TILE_OVERLAY_ICON_SIZE_CLASS,
    "[&_svg]:block [&_svg]:fill-current",
    "hover:opacity-70 active:scale-90 aria-pressed:text-primary",
    "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
].join(" ");
