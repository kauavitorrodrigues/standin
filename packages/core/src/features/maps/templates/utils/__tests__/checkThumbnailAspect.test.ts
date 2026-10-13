import { describe, expect, it } from "vitest";
import { LAYOUT_ISSUE_CODES } from "@standin/contracts";
import { encodePng } from "../../../../assets/library/utils/encodePng";
import { checkThumbnailAspect } from "../checkThumbnailAspect";

const png = (width: number, height: number) => {
    const buffer = encodePng(
        width,
        height,
        Array.from({ length: width * height }, () => [1, 1, 1, 255])
    );

    return {
        buffer,
        originalname: "thumb.png",
        mimetype: "image/png",
        size: buffer.length,
    };
};

describe("checkThumbnailAspect", () => {
    const map = { width: 30, height: 20 };

    it("is quiet when the proportion matches", () => {
        expect(checkThumbnailAspect(png(60, 40), map)).toEqual([]);
    });

    it("tolerates the drift the spec allows", () => {
        expect(checkThumbnailAspect(png(150, 100), map)).toEqual([]);
    });

    it("warns when the proportion is off", () => {
        const [warning] = checkThumbnailAspect(png(40, 40), map);

        expect(warning.code).toBe(LAYOUT_ISSUE_CODES.THUMBNAIL_ASPECT_MISMATCH);
    });

    it("has nothing to say about a file that is not a PNG", () => {
        expect(
            checkThumbnailAspect(
                {
                    buffer: Buffer.from("not a png at all, just text"),
                    originalname: "x.png",
                    mimetype: "image/png",
                    size: 10,
                },
                map
            )
        ).toEqual([]);
    });
});
