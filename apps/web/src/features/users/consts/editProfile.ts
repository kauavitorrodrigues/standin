// The route that updates the signed in person.
export const USER_ME_PATH = "/users/me";

// What the person is told when saving the profile goes wrong. The success is
// not announced, the window just closes.
export const EDIT_PROFILE_MESSAGES = {
    UPDATE_FAILED: "Não foi possível salvar o perfil.",
} as const;

// What the form tells the person about their own fields.
export const EDIT_PROFILE_VALIDATION_MESSAGES = {
    NAME_INVALID: "Informe o nome completo.",
} as const;
