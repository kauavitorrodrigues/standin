// The look of the local avatar while the mouse is on it or its card is open.
// It is drawn from the pixels of its own frame: a one pixel ring around it
// and, with no skin, the body in see-through blue, and a darker blue on the body pixels that
// touch the ring or a light detail. The light pixels of the sheet, like the
// eyes and a white outline, are kept as they are.
export const AVATAR_OUTLINE_STYLES = {
    // The ring only, and the avatar is left as it is. For the avatars of the
    // users, which have their own colors and outline.
    RING_ONLY: "ring-only",
    // The ring plus the see-through blue body. For avatars with no skin.
    FULL: "full",
} as const;

export type AvatarOutlineStyle =
    (typeof AVATAR_OUTLINE_STYLES)[keyof typeof AVATAR_OUTLINE_STYLES];

export const AVATAR_OUTLINE = {
    RING_COLOR: { r: 78, g: 161, b: 243 },
    // Reach of the ring in steps up, down, left or right from the body. It
    // stays one pixel wide on a straight edge and steps on a diagonal.
    RING_REACH_STEPS: 1,
    BODY_COLOR: { r: 78, g: 161, b: 243 },
    // From 0 (gone) to 1 (solid).
    BODY_ALPHA: 0.5,
    EDGE_COLOR: { r: 53, g: 118, b: 176 },
    // A sheet with up to this many opaque colors is flat, an avatar with no
    // skin, and gets the full look. The ghost has two.
    FULL_STYLE_MAX_COLORS: 3,
    // Pixels at least this light (0 to 255) are details, and keep their color.
    HIGHLIGHT_LUMINANCE: 200,
    // Room around the frame so the ring is not cut at its edges.
    PADDING_PX: 1,
    // Over the depth of the sprite by this much, so it draws right on it.
    DEPTH_ABOVE_AVATAR: 0.01,
    // Alpha under which a pixel of the sheet is not part of the body.
    BODY_ALPHA_THRESHOLD: 1,
    TEXTURE_KEY_PREFIX: "avatar-outline",
} as const;
