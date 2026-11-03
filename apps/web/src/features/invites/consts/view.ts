// Where the people are managed: the sections of the settings dialog that the
// invite dialog sends to. The values are the ids of those sections.
export const MANAGE_TARGETS = {
    MEMBERS: "members",
    GUESTS: "guests",
} as const;

// The two tabs of the invite screen.
export const INVITE_TABS = {
    MEMBERS: "members",
    GUESTS: "guests",
} as const;

// How the member card asks for people.
export const MEMBER_INVITE_MODES = {
    LINK: "link",
    EMAIL: "email",
} as const;
