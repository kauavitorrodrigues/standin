import { describe, expect, it } from "vitest";
import { buildProfilePictureFormData } from "../buildProfilePictureFormData";

describe("buildProfilePictureFormData", () => {
    it("sends only the file, as it is", () => {
        const file = new File(["raw"], "photo.jpg", { type: "image/jpeg" });

        const body = buildProfilePictureFormData(file);

        expect(body.get("file")).toBe(file);
        expect([...body.keys()]).toEqual(["file"]);
    });
});
