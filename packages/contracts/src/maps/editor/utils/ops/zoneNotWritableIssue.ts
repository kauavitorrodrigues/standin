import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../../layout/issues";

/** Issue for a zone the editor cannot write back, so no inverse exists. */
export const zoneNotWritableIssue = (zoneId: number): LayoutIssue =>
    createIssue(
        Code.ZONE_KIND_INVALID,
        `zones.${zoneId}`,
        Messages.zoneKindInvalid
    );
