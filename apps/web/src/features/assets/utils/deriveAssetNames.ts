// "tree_orchard_sapling.png" -> "tree_orchard_sapling"
export const getFileBaseName = (fileName: string) =>
    fileName.replace(/\.[^.]+$/, "");

// "tree_orchard_sapling" -> "Tree orchard sapling"
export const toDisplayName = (text: string) => {
    const spaced = text.replace(/[_-]+/g, " ").trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

// "Tree orchard sapling" -> "tree-orchard-sapling", what the key of the piece
// looks like. The API has the last word and adds a suffix if it is taken.
export const toKeyPreview = (name: string) =>
    name
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
