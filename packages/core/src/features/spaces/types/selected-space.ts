import type { spaceReadSelect, spaceSelect } from "../consts/select";

type Selected = Record<string, { _: { data: unknown; notNull: boolean } }>;

// The type of a row of `select`, with null for a column that allows it.
type RowOf<Select extends Selected> = {
    [Key in keyof Select]: Select[Key]["_"]["notNull"] extends true
        ? Select[Key]["_"]["data"]
        : Select[Key]["_"]["data"] | null;
};

// A read row carries the creation date as a Date and the thumbnail's storage
// key; the contract carries an ISO string and the public url. The key is null
// without a photo, which the left join gives and the column type does not say.
export type SelectedSpace = Omit<
    RowOf<typeof spaceReadSelect>,
    "thumbnailFileName"
> & {
    thumbnailFileName: string | null;
};

// The row of a `returning`, which has the thumbnail as the id of its file.
export type ReturnedSpace = RowOf<typeof spaceSelect>;
