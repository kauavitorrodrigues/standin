import { describe, expect, it, vi } from "vitest";
import { applyProfilePictureChange } from "../applyProfilePictureChange";

const change = { userId: "ana", profilePictureUrl: "/files/f1" };

const build = () => ({
    scene: { setUserProfilePicture: vi.fn() },
    updateOwnPicture: vi.fn(),
    refreshPictures: vi.fn(),
});

describe("applyProfilePictureChange", () => {
    it("changes the tag of someone else in the scene", () => {
        const params = build();

        applyProfilePictureChange({
            change,
            selfUserId: "bruno",
            ownPictureUrl: null,
            ...params,
        });

        expect(params.scene.setUserProfilePicture).toHaveBeenCalledWith(
            "ana",
            "/files/f1"
        );
        expect(params.updateOwnPicture).not.toHaveBeenCalled();
        expect(params.refreshPictures).toHaveBeenCalledTimes(1);
    });

    it("passes a removed picture on as null", () => {
        const params = build();

        applyProfilePictureChange({
            change: { userId: "ana", profilePictureUrl: null },
            selfUserId: "bruno",
            ownPictureUrl: null,
            ...params,
        });

        expect(params.scene.setUserProfilePicture).toHaveBeenCalledWith(
            "ana",
            null
        );
    });

    it("updates the picture of the signed in person when it is them, from another tab", () => {
        const params = build();

        applyProfilePictureChange({
            change,
            selfUserId: "ana",
            ownPictureUrl: null,
            ...params,
        });

        expect(params.updateOwnPicture).toHaveBeenCalledWith("/files/f1");
        expect(params.scene.setUserProfilePicture).not.toHaveBeenCalled();
        expect(params.refreshPictures).toHaveBeenCalledTimes(1);
    });

    it("has nothing to apply on the tab that saved, which already holds the picture", () => {
        const params = build();

        applyProfilePictureChange({
            change,
            selfUserId: "ana",
            ownPictureUrl: "/files/f1",
            ...params,
        });

        expect(params.updateOwnPicture).not.toHaveBeenCalled();
        expect(params.refreshPictures).not.toHaveBeenCalled();
        expect(params.scene.setUserProfilePicture).not.toHaveBeenCalled();
    });

    it("does not fail while there is no scene", () => {
        const { scene: _scene, ...params } = build();

        expect(() =>
            applyProfilePictureChange({
                change,
                selfUserId: "bruno",
                ownPictureUrl: null,
                scene: null,
                ...params,
            })
        ).not.toThrow();
        expect(params.refreshPictures).toHaveBeenCalledTimes(1);
    });
});
