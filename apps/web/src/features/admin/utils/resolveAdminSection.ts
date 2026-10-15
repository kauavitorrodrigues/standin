import {
    ADMIN_SECTIONS,
    DEFAULT_ADMIN_SECTION,
    type AdminSection,
} from "../consts/adminSections";

// The section is the page the URL is on: /admin/assets and everything under
// it is the assets section.
export const resolveAdminSection = (pathname: string): AdminSection =>
    ADMIN_SECTIONS.find(
        ({ to }) => pathname === to || pathname.startsWith(`${to}/`)
    )?.value ?? DEFAULT_ADMIN_SECTION;
