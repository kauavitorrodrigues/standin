import { describe, expect, it } from "vitest";
import {
    AVATAR_ANIMATIONS,
    AVATAR_SHEET_DIRECTIONS,
    AVATAR_FRAMES,
} from "@standin/contracts";
import { buildAvatarAnimationKey, buildAvatarTextureKey } from "../avatarKeys";
import {
    listAvatarAnimationKeys,
    registerAvatarAnimations,
} from "../registerAvatarAnimations";
import { createFakeAvatarHost } from "./fakeAvatarHost";

const TEXTURE = "avatar-sheet:ghost";

describe("avatar keys", () => {
    it("builds predictable keys", () => {
        expect(buildAvatarTextureKey("abc")).toBe("avatar-sheet:abc");
        expect(buildAvatarAnimationKey(TEXTURE, "WALK", "left")).toBe(
            "avatar-sheet:ghost:WALK_left"
        );
    });
});

describe("registerAvatarAnimations", () => {
    it("creates one animation per animation and direction", () => {
        const fake = createFakeAvatarHost();

        registerAvatarAnimations(fake.host, TEXTURE);

        const expected =
            Object.keys(AVATAR_ANIMATIONS).length *
            AVATAR_SHEET_DIRECTIONS.length;
        expect(fake.mocks.anims.create).toHaveBeenCalledTimes(expected);
        expect(fake.animations).toEqual(
            new Set(listAvatarAnimationKeys(TEXTURE))
        );
    });

    it("takes the frames from the poses of the animation in the direction", () => {
        const fake = createFakeAvatarHost();

        registerAvatarAnimations(fake.host, TEXTURE);

        const walkLeft = fake.mocks.anims.create.mock.calls
            .map(([config]) => config)
            .find((config) => config.key === `${TEXTURE}:WALK_left`);
        expect(
            (walkLeft as { frameRate?: number } | undefined)?.frameRate
        ).toBe(AVATAR_ANIMATIONS.WALK.fps);
        expect(fake.mocks.anims.generateFrameNumbers).toHaveBeenCalledWith(
            TEXTURE,
            {
                frames: [...AVATAR_FRAMES.WALK.left],
            }
        );
    });

    it("registers a texture only once", () => {
        const fake = createFakeAvatarHost();

        registerAvatarAnimations(fake.host, TEXTURE);
        registerAvatarAnimations(fake.host, TEXTURE);

        expect(fake.mocks.anims.create).toHaveBeenCalledTimes(
            listAvatarAnimationKeys(TEXTURE).length
        );
    });

    it("keeps the animations of two textures apart", () => {
        const fake = createFakeAvatarHost();

        registerAvatarAnimations(fake.host, TEXTURE);
        registerAvatarAnimations(fake.host, "avatar-sheet:other");

        expect(fake.animations.size).toBe(
            listAvatarAnimationKeys(TEXTURE).length * 2
        );
    });
});
