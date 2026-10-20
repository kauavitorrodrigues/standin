import { PNG } from "pngjs";
import { AVATAR_SHEET_PX } from "@standin/contracts";

const DEFLATE_LEVEL = 9;
const FILTER_NONE = 0;

// The same pixels always give the same bytes, since the compression level and
// the filter are fixed.
export const encodeSheet = (rgba: Uint8Array): Buffer => {
    const png = new PNG({
        width: AVATAR_SHEET_PX.w,
        height: AVATAR_SHEET_PX.h,
    });
    png.data = Buffer.from(rgba);

    return PNG.sync.write(png, {
        deflateLevel: DEFLATE_LEVEL,
        filterType: FILTER_NONE,
    });
};
