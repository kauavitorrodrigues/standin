// Where a walk is going, for the text of the chip. A walk of a double click
// goes to a tile; the page can also ask for the own desk or for a person.
export type WalkPurpose =
    { kind: "tile" } | { kind: "desk" } | { kind: "person"; userId: string };
