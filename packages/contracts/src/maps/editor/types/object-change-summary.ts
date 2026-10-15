// What a decorator draft changes, counted by object for the floating bar and
// for the warning shown before the own desk goes away.
export type ObjectChangeSummary = {
    // New objects still in the draft. A placed object removed in the same
    // draft does not count.
    placed: number;
    // Objects of the map that were moved.
    moved: number;
    // Objects of the map that were replaced (model, color or rotation).
    replaced: number;
    // Objects of the map that were removed.
    removed: number;
    // The draft removes a desk the actor owns, so the person ends up without a desk.
    ownDeskRemoved: boolean;
    // Objects that sit on the own desk removed and go with it.
    ownDeskItems: number;
};
