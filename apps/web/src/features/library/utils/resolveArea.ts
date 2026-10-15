import { AREA_VALUES, type Area } from "../consts/areas";

// The area is the part of the app the URL is on: everything under /library is
// the library, the rest belongs to the spaces.
export const resolveArea = (pathname: string): Area => {
    if (pathname.startsWith("/library")) return AREA_VALUES.LIBRARY;
    return AREA_VALUES.SPACES;
};
