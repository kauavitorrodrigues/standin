// One piece of confetti, in world px and ms. Speeds are px per second.
export type ConfettiPieceState = {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    rotation: number;
    // Radians per second.
    spin: number;
    // The phase of the flip that squeezes the piece like a turning paper.
    flip: number;
    flipSpeed: number;
    colorIndex: number;
    ageMs: number;
    lifeMs: number;
};
