import type { MessageSender } from "@standin/contracts";

type CurrentUser = {
    id: string;
    name: string;
    profilePictureUrl: string | null;
};

// The sender of the messages of the signed in person. The list endpoint does
// not ship it (see resolveSender), so it is built from who is signed in, with
// their own picture.
export const buildOwnSender = ({
    id,
    name,
    profilePictureUrl,
}: CurrentUser): MessageSender => ({ id, name, profilePictureUrl });
