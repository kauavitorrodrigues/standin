// A scroll of the camera, in world px, moved to the nearest whole px of the
// screen. A world px is `zoom` screen px, so a scroll on whole world px (what
// Phaser does with `roundPixels`) moves the map in steps of `zoom` screen px,
// while an avatar that walks on fractions of a px moves in between them: at
// zoom 4 the avatar drifts back and forth against the floor by up to 2 screen
// px. On whole screen px the drift is at most half a px, which is not seen.
export const snapToScreenPixel = (scroll: number, zoom: number): number =>
    zoom > 0 ? Math.round(scroll * zoom) / zoom : scroll;
