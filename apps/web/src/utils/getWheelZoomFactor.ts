// How much one px of `deltaY` zooms, as the exponent of the factor. Small, so a
// mouse notch (100px) changes the zoom by about 10% and a trackpad glides.
const WHEEL_ZOOM_SENSITIVITY = 0.001;

// The wheel reports lines or pages instead of px in some browsers.
const LINE_HEIGHT_PX = 16;
const PAGE_HEIGHT_PX = 400;

const getDeltaPx = (event: WheelEvent): number => {
    switch (event.deltaMode) {
        case WheelEvent.DOM_DELTA_LINE:
            return event.deltaY * LINE_HEIGHT_PX;
        case WheelEvent.DOM_DELTA_PAGE:
            return event.deltaY * PAGE_HEIGHT_PX;
        default:
            return event.deltaY;
    }
};

// The factor to multiply the zoom by for one wheel event: above 1 turning the
// wheel up (zoom in), below 1 turning it down (zoom out). It is continuous, so
// the zoom follows how far the wheel turns.
export const getWheelZoomFactor = (event: WheelEvent): number =>
    Math.exp(-getDeltaPx(event) * WHEEL_ZOOM_SENSITIVITY);
