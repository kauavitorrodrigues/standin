// Where a walk is going, for the text of the chip. A walk of a double click
// goes to a tile; the page can also ask for the own desk, for a person or for
// the reach of an object that embeds a website.
export type WalkPurpose =
    | { kind: "tile" }
    | { kind: "desk" }
    | { kind: "website" }
    | { kind: "person"; userId: string };
