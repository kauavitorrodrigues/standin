import { AVATAR } from "@standin/contracts";

// Where the anchor sits in the frame, as a fraction of it, so the sprite
// stands with the feet on its position.
export const AVATAR_SPRITE_ORIGIN = {
    x: AVATAR.anchor.x / AVATAR.frame.w,
    y: AVATAR.anchor.y / AVATAR.frame.h,
} as const;

// Where the collision body starts inside the frame, so it is centered on the
// anchor and grows upwards from it.
export const AVATAR_BODY_OFFSET = {
    x: AVATAR.anchor.x - AVATAR.body.w / 2,
    y: AVATAR.anchor.y - AVATAR.body.h,
} as const;

// The frame of the sheet an avatar shows before it plays an animation.
export const AVATAR_FIRST_FRAME = 0;

// Id the sheet binder uses for the local player. Remote avatars are bound by
// their socket id, which never has this value.
export const LOCAL_AVATAR_BINDING_ID = "local";
