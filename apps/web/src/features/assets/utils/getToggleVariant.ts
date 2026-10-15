// The look of a button that is part of a group where one is on: the one that
// is on is filled, the others are plain.
export const getToggleVariant = (active: boolean): "secondary" | "ghost" => {
    if (active) return "secondary";
    return "ghost";
};

// The look of a tool in a toolbar: the one in use is filled with the main
// color, so it never looks like the hover of the others.
export const getToolVariant = (active: boolean): "default" | "ghost" => {
    if (active) return "default";
    return "ghost";
};

// The same, for a group whose buttons keep their outline.
export const getChoiceVariant = (active: boolean): "secondary" | "outline" => {
    if (active) return "secondary";
    return "outline";
};
