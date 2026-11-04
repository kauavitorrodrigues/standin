export type TravelTracker = {
    // Takes the position of the frame. True once, on the frame the distance
    // walked reaches the minimum.
    update: (x: number, y: number) => boolean;
};
