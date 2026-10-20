import { resetUserAvatar } from "./resetUserAvatar";

/**
 * Removes every choice (parts and base) and the assembled sheet of the person,
 * who goes back to the default base, or to the ghost when there is none. The
 * old file is deleted after the listeners were told.
 */
export const clearUserAvatar = async (userId: string): Promise<void> =>
    resetUserAvatar(userId, null);
