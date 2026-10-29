// Turns a name into something safe to put in an id: lower case, letters and
// digits, one dash between words.
const toSlug = (value: string): string =>
    value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

// Ids for tests and tools to find the controls of the avatar editor.
export const AVATAR_TEST_IDS = {
    randomize: "avatar-randomize",
    download: "avatar-download",
    part: (slot: string, name: string) => `avatar-part-${slot}-${toSlug(name)}`,
    color: (slot: string, colorKey: string) =>
        `avatar-color-${slot}-${toSlug(colorKey)}`,
} as const;
