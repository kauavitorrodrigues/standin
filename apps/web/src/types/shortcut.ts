export type Shortcut = {
    // Matched against `event.key`, lowercase.
    keys: readonly string[];
    // What the tooltip shows.
    label: string;
};
