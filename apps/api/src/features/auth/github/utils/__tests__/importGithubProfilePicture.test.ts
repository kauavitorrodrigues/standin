import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PROFILE_PICTURE } from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    updateMock: vi.fn(),
    downloadAvatar: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    UserService: { updateProfilePicture: mocks.updateMock },
}));
vi.mock("@standin/infra", () => ({
    GithubProvider: { downloadAvatar: mocks.downloadAvatar },
}));

import { importGithubProfilePicture } from "../importGithubProfilePicture";

const AVATAR = "https://avatars.githubusercontent.com/u/583231?v=4";

const image = (format: "png" | "jpeg") =>
    sharp({
        create: {
            width: 300,
            height: 200,
            channels: 3,
            background: { r: 10, g: 80, b: 200 },
        },
    })
        [format]()
        .toBuffer();

describe("importGithubProfilePicture", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it.each(["png", "jpeg"] as const)(
        "saves a %s photo as the 256 x 256 PNG through the shared pipeline",
        async (format) => {
            mocks.downloadAvatar.mockResolvedValue(await image(format));

            const saved = await importGithubProfilePicture("u1", AVATAR);

            expect(saved).toBe(true);
            expect(mocks.downloadAvatar).toHaveBeenCalledWith(AVATAR);
            const [userId, action] = mocks.updateMock.mock.calls[0];
            expect(userId).toBe("u1");
            expect(action.action).toBe("set");
            const meta = await sharp(action.file.buffer).metadata();
            expect([meta.format, meta.width, meta.height]).toEqual([
                "png",
                PROFILE_PICTURE.outputSize,
                PROFILE_PICTURE.outputSize,
            ]);
        }
    );

    it("does nothing when the provider has no bytes", async () => {
        mocks.downloadAvatar.mockResolvedValue(null);

        expect(await importGithubProfilePicture("u1", AVATAR)).toBe(false);
        expect(mocks.updateMock).not.toHaveBeenCalled();
    });

    it("never throws on a response that is not an image", async () => {
        mocks.downloadAvatar.mockResolvedValue(
            Buffer.from("<html>not an image</html>")
        );

        expect(await importGithubProfilePicture("u1", AVATAR)).toBe(false);
        expect(mocks.updateMock).not.toHaveBeenCalled();
    });

    it("never throws when the download throws", async () => {
        mocks.downloadAvatar.mockRejectedValue(new Error("boom"));

        expect(await importGithubProfilePicture("u1", AVATAR)).toBe(false);
    });

    it("never throws when saving the photo fails", async () => {
        mocks.downloadAvatar.mockResolvedValue(await image("png"));
        mocks.updateMock.mockRejectedValue(new Error("storage down"));

        expect(await importGithubProfilePicture("u1", AVATAR)).toBe(false);
        expect(console.error).toHaveBeenCalled();
    });
});
