// Whether a layer drawn over the tile takes the pointer: not while the
// tileset is being saved or the tile is locked.
export const getPointerEvents = (disabled: boolean): "none" | "auto" => {
    switch (disabled) {
        case true:
            return "none";
        default:
            return "auto";
    }
};
