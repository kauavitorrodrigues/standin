import { SPACE_SETTINGS_SECTIONS } from "../consts/sections";
import type { SettingsSectionId } from "../consts/sections";
import type { SettingsSpace } from "../types";

// The members list shows e-mails, so only who invites has it.
const isRestrictedToInviters = (id: SettingsSectionId): boolean =>
    id === "members";

// The server only lets the owner save these, so only the owner sees them.
const isRestrictedToManagers = (id: SettingsSectionId): boolean =>
    id === "conversations" || id === "security";

/**
 * The one rule for what the dialog offers. The sections of the space need a
 * space, the members list also needs the right to invite, and the settings of
 * the space need the right to manage it. The sidebar, the mounted sections and
 * the section it lands on all ask this, so they agree.
 */
export const isSectionOffered = (
    id: SettingsSectionId,
    space: SettingsSpace | undefined
): boolean => {
    if (!SPACE_SETTINGS_SECTIONS.includes(id)) return true;
    if (!space) return false;
    if (isRestrictedToInviters(id)) return space.canInvite;
    if (isRestrictedToManagers(id)) return space.canManage;
    return true;
};
