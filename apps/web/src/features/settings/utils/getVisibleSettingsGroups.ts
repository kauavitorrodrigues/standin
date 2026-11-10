import { SETTINGS_SECTION_GROUPS } from "../consts/sectionGroups";
import type { SettingsSectionGroup } from "../consts/sectionGroups";
import type { SettingsSpace } from "../types";
import { isSectionOffered } from "./isSectionOffered";

/**
 * The groups the dialog offers: the group of the space only inside one, and in
 * every group only the sections the person may use (a preference such as the
 * integrations can also need a space).
 */
export const getVisibleSettingsGroups = (
    space: SettingsSpace | undefined
): SettingsSectionGroup[] =>
    SETTINGS_SECTION_GROUPS.flatMap((group) => {
        if (group.isSpace && !space) return [];

        const sections = group.sections.filter(({ id }) =>
            isSectionOffered(id, space)
        );
        return sections.length === 0 ? [] : [{ ...group, sections }];
    });
