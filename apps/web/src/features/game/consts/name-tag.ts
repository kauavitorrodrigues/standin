// The look of the name tag over an avatar. It is a DOM element that follows
// the avatar (see `NameTag`), so the sizes are CSS px. The values were measured
// on the Gather tag at the same pixel density (the font is the 12px the game
// asks for), so the tag is the same size and shape: a rounded box with a small
// tail pointing down at the avatar.
export const NAME_TAG = {
    // The box without the tail, which has one line of text.
    HEIGHT: 24,
    TAIL_HEIGHT: 4,
    // The tail is a triangle, as wide as twice its height.
    TAIL_WIDTH: 8,
    PADDING_X: 6,
    PADDING_Y: 4,
    GAP: 4,
    RADIUS: 8,
    FONT_SIZE: 12,
    LINE_HEIGHT: 16,
    FONT_WEIGHT: 400,
    // Inter sits a pixel higher in the line here than in the Gather tag.
    TEXT_OFFSET_Y: 1,
    // The green dot that says the person is online.
    DOT_SIZE: 8,
    // The Gather dot sits a pixel to the right of where the padding puts it,
    // with the name staying where it is.
    DOT_OFFSET_X: 1,
    // The photo that takes the place of the dot when the tag is clicked.
    PHOTO_SIZE: 20,
    PHOTO_BADGE_SIZE: 6,
    TEXT_COLOR: "#ffffff",
    BACKGROUND_COLOR: "#171717",
    // The tag of the local player has its own color.
    LOCAL_BACKGROUND_COLOR: "#5f4dc5",
    DOT_COLOR: "#00c245",
    // The chat icon that takes the place of the dot while the person types.
    TYPING_ICON_SIZE: 12,
    // The glow of the tag that was clicked.
    SELECTED_SHADOW: "0px 0px 8px 2px #3893e3",
    MAX_CHARACTERS: 20,
    ELLIPSIS: "...",
    // The tag keeps its size on the screen at every zoom and only its position
    // follows the avatar, like the Gather tag. True makes it grow and shrink
    // with the zoom, as a part of the map would.
    SCALES_WITH_ZOOM: false,
    // The tag of another person stays under the one of the local player, and
    // inside a layer the lower avatar of the map draws over the one behind it.
    // A layer is taller than any map, so the order by height never runs out.
    Z_INDEX_PER_LAYER: 100_000,
} as const;

// The box and its tail, which is what takes room over the avatar.
export const NAME_TAG_TOTAL_HEIGHT = NAME_TAG.HEIGHT + NAME_TAG.TAIL_HEIGHT;

export const NAME_TAG_LAYERS = {
    OTHER: 0,
    LOCAL: 1,
    // The tag that was clicked draws over every other.
    SELECTED: 2,
} as const;

export type NameTagLayer =
    (typeof NAME_TAG_LAYERS)[keyof typeof NAME_TAG_LAYERS];
