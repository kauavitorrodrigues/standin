// Hover events of the avatar of the person. The generic hover helpers add
// their own suffixes for the click and the selection.
export const AVATAR_EVENTS = {
    HOVER_CHANGED: "avatar:hover-changed",
} as const;

// Hover events of the avatars of the other people. Each avatar is a target, by
// the socket id of its peer. A click on one selects it, and its name tag shows
// the photo.
export const REMOTE_AVATAR_EVENTS = {
    HOVER_CHANGED: "remote-avatar:hover-changed",
} as const;

// The one target of that event: the avatar of the local person.
export const OWN_AVATAR_TARGET_ID = "own-avatar";

// The highlight paints the empty pixels around the sprite, and the translucent
// line inside the solid edge of the sprite. The ghost sheet already draws the
// white edge.
export const AVATAR_HIGHLIGHT = {
    PIPELINE_KEY: "avatar-outline",
    // RGB, each from 0 to 1.
    COLOR: { r: 0x80 / 255, g: 0xc8 / 255, b: 0xff / 255 },
    // The line inside the white edge of the sprite.
    INNER_COLOR: { r: 0x59 / 255, g: 0x91 / 255, b: 0xbe / 255 },
    // The fill of the translucent body, so it looks the same on any floor.
    BODY_COLOR: { r: 0x78 / 255, g: 0x91 / 255, b: 0xad / 255 },
    // Width of the outer line, in px of the map: px of the pixel art.
    WIDTH: 0.8,
} as const;
