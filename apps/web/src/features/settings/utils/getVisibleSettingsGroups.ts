import { SETTINGS_SECTION_GROUPS } from "../consts/sectionGroups";
import type { SettingsSectionGroup } from "../consts/sectionGroups";
import type { SettingsSpace } from "../types";
import { isSectionOffered } from "./isSectionOffered";

/**
 * The groups the dialog offers: the preferences always, the group of the space
 * only inside one, and in it only what the person may use.
 */
export const getVisibleSettingsGroups = (
    space: SettingsSpace | undefined
): SettingsSectionGroup[] =>
    SETTINGS_SECTION_GROUPS.flatMap((group) => {
        if (!group.isSpace) return [group];
        if (!space) return [];

        const sections = group.sections.filter(({ id }) =>
            isSectionOffered(id, space)
        );
        return [{ ...group, sections }];
    });
