import { NEW_AREA_DEFAULT_SIZE } from "../consts/newArea";

type NewAreaSearch = { width: number; height: number };

const readSize = (value: unknown, fallback: number): number => {
    const size = Number(value);
    return Number.isInteger(size) && size > 0 ? size : fallback;
};

// The size the dialog chose, carried in the URL of the composer.
export const parseNewAreaSearch = (
    search: Record<string, unknown>
): NewAreaSearch => ({
    width: readSize(search.width, NEW_AREA_DEFAULT_SIZE.width),
    height: readSize(search.height, NEW_AREA_DEFAULT_SIZE.height),
});
