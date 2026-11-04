import type { SpaceAnnouncer } from "@standin/contracts";

// The names in the order received. Someone whose name is not known gets the
// fallback the caller passes, since the wording belongs to the screen.
export const listAnnouncerNames = (
    announcers: readonly SpaceAnnouncer[],
    names: ReadonlyMap<string, string>,
    fallback: string
): string[] =>
    announcers.map((announcer) => names.get(announcer.userId) ?? fallback);
