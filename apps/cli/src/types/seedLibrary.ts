export type SeedLibraryArgs = {
    folder?: string;
};

// The entries of a seed library, by key, for the dry run.
export type SeedKeyLists = {
    tilesets: string[];
    assets: string[];
    bundles: string[];
    areas: string[];
    avatarBases: string[];
    avatarParts: string[];
};

// A group of the seed result and the word a line uses for it.
export type SeedGroup = {
    group: keyof SeedKeyLists;
    label: string;
};

export type SeedDryRunResult = {
    dryRun: true;
    databaseChecked: false;
    keys: SeedKeyLists;
};
