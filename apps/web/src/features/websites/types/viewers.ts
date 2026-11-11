// Who has which object open, by connection: the server tells one connection at
// a time, and a person who left is dropped by their socket id.
export type WebsiteViewersState = ReadonlyMap<
    string,
    { userId: string; objectId: string }
>;

// A person looking at an object, with what the chip and the list draw.
export type WebsiteViewerPerson = {
    userId: string;
    name: string;
    avatar: string | null;
};
