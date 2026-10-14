type Params = {
    hasCrop: boolean;
    hasFootprint: boolean;
    isAnimated: boolean;
    solid: boolean;
    // The form that holds the editor keeps a collision mask.
    canEdit: boolean;
};

// Why the collision painter cannot be used, in words for the user, or null
// when it can.
export const getCollisionBlocker = ({
    hasCrop,
    hasFootprint,
    isAnimated,
    solid,
    canEdit,
}: Params): string | null => {
    if (!canEdit) return "A colisão não pode ser pintada neste editor.";
    if (!hasCrop || !hasFootprint) {
        return "Marque o recorte e a pegada para pintar a colisão.";
    }
    if (isAnimated) return "Uma peça animada bloqueia pelos tiles da pegada.";
    if (!solid) return "Ligue Bloqueia a passagem para pintar a colisão.";
    return null;
};
