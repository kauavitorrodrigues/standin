// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { buildThumbnailFormData } from "../buildThumbnailFormData";

describe("buildThumbnailFormData", () => {
    const png = new Blob(["png-bytes"], { type: "image/png" });

    it("sends the blob as a PNG file under the thumbnail field", () => {
        const file = buildThumbnailFormData(png).get("thumbnail") as File;

        expect(file).toBeInstanceOf(File);
        expect(file.name).toBe("thumbnail.png");
        expect(file.type).toBe("image/png");
        expect(file.size).toBe(png.size);
    });

    it("sends the file and nothing else", () => {
        const keys = [...buildThumbnailFormData(png).keys()];

        expect(keys).toEqual(["thumbnail"]);
    });

    it("types the file as a PNG even when the blob carries no type", () => {
        const file = buildThumbnailFormData(new Blob(["x"])).get(
            "thumbnail"
        ) as File;

        expect(file.type).toBe("image/png");
    });
});
