// What the confirmation of removing claimed desks says.
export type DeskRemovalPrompt = {
    // The names of the owners, already joined ("Ana, Bia e Caio").
    owners: string;
    // More than one desk is being removed.
    plural: boolean;
};
