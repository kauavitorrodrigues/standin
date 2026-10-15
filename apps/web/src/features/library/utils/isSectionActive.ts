// A section owns its page and everything under it: /library/assets is the
// assets section, and so is /library/assets/new.
export const isSectionActive = (pathname: string, to: string): boolean =>
    pathname === to || pathname.startsWith(`${to}/`);
