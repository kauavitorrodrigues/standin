// How far the wheel has to turn, in px of `deltaY`, for one step. A mouse
// notch is 100, and a trackpad adds up small moves to it.
export const WHEEL_STEP_PX = 50;

// The direction of the wheel turn added up so far: 0 until it has reached one
// step, then 1 (up, zoom in) or -1 (down, zoom out). The caller resets the sum
// after a step.
export const getWheelDirection = (turned: number): 1 | -1 | 0 => {
    if (Math.abs(turned) < WHEEL_STEP_PX) return 0;

    return turned < 0 ? 1 : -1;
};
