export const MIN_PASSWORD_LENGTH = 8;

// bcrypt silently ignores bytes past position 72, so anything longer is
// truncated without warning — capping input here keeps what the user typed
// and what actually gets hashed the same.
export const MAX_PASSWORD_LENGTH = 72;

export const SEQUENTIAL_PATTERNS = ["abcdefgh", "12345678", "87654321"];

export const COMMON_SEQUENCES = ["abcd", "1234", "qwerty", "asdf", "zxcv"];

export const SPECIAL_CHARACTERS = "@#%&$!*()_+-=[]{}|;:,.<>?";

export const countCharacterTypes = (password: string): number => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = new RegExp(
        `[${SPECIAL_CHARACTERS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`,
    ).test(password);
    return [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
};
