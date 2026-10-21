import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ProfilePictureInvalidError,
    ProfilePictureUnsupportedMediaError,
} from "@standin/contracts";

const { updateMock, buildMock } = vi.hoisted(() => ({
    updateMock: vi.fn(),
    buildMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    UserService: { updateProfilePicture: updateMock },
}));
vi.mock("../../utils/buildProfilePictureAction", () => ({
    buildProfilePictureAction: buildMock,
}));

import { removeProfilePicture } from "../removeProfilePicture";
import { setProfilePicture } from "../setProfilePicture";

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const user = { id: "u1", profilePictureUrl: "/files/f1" };
const action = { action: "set", file: { buffer: Buffer.from("png") } };
const validFile = {
    buffer: Buffer.from("raw"),
    mimetype: "image/jpeg",
    size: 3,
};

describe("setProfilePicture controller", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("builds the action from the upload and hands it to the core", async () => {
        buildMock.mockResolvedValue(action);
        updateMock.mockResolvedValue(user);
        const res = buildRes();

        await setProfilePicture(
            {
                user: { id: "u1" },
                file: validFile,
                body: {},
            } as any,
            res
        );

        expect(buildMock).toHaveBeenCalledWith(validFile.buffer);
        expect(updateMock).toHaveBeenCalledWith("u1", action);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ user });
    });

    it("answers 415 with no file", async () => {
        const res = buildRes();

        await setProfilePicture({ user: { id: "u1" }, body: {} } as any, res);

        expect(buildMock).not.toHaveBeenCalled();
        expect(updateMock).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(
            new ProfilePictureUnsupportedMediaError().status
        );
        expect(res.json).toHaveBeenCalledWith({
            error: new ProfilePictureUnsupportedMediaError().message,
            code: "PROFILE_PICTURE_UNSUPPORTED_MEDIA",
        });
    });

    it("answers 422 for a mime type that is not accepted, without processing", async () => {
        const res = buildRes();

        await setProfilePicture(
            {
                user: { id: "u1" },
                file: { ...validFile, mimetype: "image/gif" },
                body: {},
            } as any,
            res
        );

        expect(buildMock).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(422);
    });

    it("maps an image that cannot be decoded to 422 and persists nothing", async () => {
        buildMock.mockRejectedValue(new ProfilePictureInvalidError());
        const res = buildRes();

        await setProfilePicture(
            { user: { id: "u1" }, file: validFile, body: {} } as any,
            res
        );

        expect(updateMock).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            error: new ProfilePictureInvalidError().message,
            code: "PROFILE_PICTURE_INVALID",
        });
    });
});

describe("removeProfilePicture controller", () => {
    beforeEach(() => vi.clearAllMocks());

    it("hands a remove action to the core", async () => {
        updateMock.mockResolvedValue({ id: "u1", profilePictureUrl: null });
        const res = buildRes();

        await removeProfilePicture({ user: { id: "u1" } } as any, res);

        expect(updateMock).toHaveBeenCalledWith("u1", { action: "remove" });
        expect(res.json).toHaveBeenCalledWith({
            user: { id: "u1", profilePictureUrl: null },
        });
    });
});
