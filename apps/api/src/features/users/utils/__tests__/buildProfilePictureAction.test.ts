import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
    PROFILE_PICTURE,
    ProfilePictureInvalidError,
} from "@standin/contracts";
import { buildProfilePictureAction } from "../buildProfilePictureAction";

const photo = () =>
    sharp({
        create: {
            width: 300,
            height: 200,
            channels: 3,
            background: { r: 10, g: 80, b: 200 },
        },
    })
        .jpeg()
        .toBuffer();

describe("buildProfilePictureAction", () => {
    it("builds a set action with the processed 256 x 256 PNG", async () => {
        const action = await buildProfilePictureAction(await photo());

        expect(action.action).toBe("set");
        if (action.action !== "set") return;
        expect(action.file).toMatchObject({
            originalname: "profile-picture.png",
            mimetype: "image/png",
        });
        expect(action.file.size).toBe(action.file.buffer.length);
        const meta = await sharp(action.file.buffer).metadata();
        expect([meta.format, meta.width, meta.height]).toEqual([
            "png",
            PROFILE_PICTURE.outputSize,
            PROFILE_PICTURE.outputSize,
        ]);
    });

    it("refuses bytes that are not an image", async () => {
        await expect(
            buildProfilePictureAction(Buffer.from("text"))
        ).rejects.toBeInstanceOf(ProfilePictureInvalidError);
    });
});
