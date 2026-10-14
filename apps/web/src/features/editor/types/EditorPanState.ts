// Whether space is held. Shared by the camera input, which pans, and the
// tool router, which must not act while the view is being moved.
export type EditorPanState = {
    spaceHeld: boolean;
};
