import path from "node:path";

const SEPARATORS: RegExp = /[\\/]/;
const PARENT: string = "..";

// True for a path that stays inside the folder it is relative to: not
// absolute and with no `..` in it. library.json names its PNGs this way.
export const isSafeRelativePath = (value: string): boolean => {
    if (path.isAbsolute(value)) return false;
    return !value.split(SEPARATORS).includes(PARENT);
};
