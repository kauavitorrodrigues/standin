// The Decorar button of the profile card. The card does not know the game: the
// page that opens it says what the button does and, when it cannot work now,
// why.
export type ProfileDecorate = {
    onDecorate: () => void;
    // Null when the button works.
    disabledReason: string | null;
};
