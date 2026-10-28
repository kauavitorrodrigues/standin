import { describe, expect, it } from "vitest";
import { SpaceSchema } from "../space.schema";
import { SpaceDetailsSchema } from "../space-details.schema";
import { SpaceUpdateSchema } from "../space.update.schema";
import { SpaceDataSchema } from "../space.data.schema";

const space = {
    id: "s1",
    name: "Lobby",
    organizationId: "org-1",
    mapId: "map-1",
    guestAccess: "ALLOWED",
    thumbnailUrl: null,
    createdAt: "2026-10-28T10:00:00.000Z",
};

describe("SpaceSchema", () => {
    it("accepts a space without a thumbnail", () => {
        expect(SpaceSchema.safeParse(space).success).toBe(true);
    });

    it("accepts a space with the url of the thumbnail", () => {
        const parsed = SpaceSchema.safeParse({
            ...space,
            thumbnailUrl: "https://cdn.test/spaces/s1/photo.png",
        });

        expect(parsed.success).toBe(true);
    });

    it("requires the thumbnail to be present, even if null", () => {
        const { thumbnailUrl: _omitted, ...withoutThumbnail } = space;

        expect(SpaceSchema.safeParse(withoutThumbnail).success).toBe(false);
    });

    it("rejects a thumbnail that is not a string", () => {
        expect(
            SpaceSchema.safeParse({ ...space, thumbnailUrl: 42 }).success
        ).toBe(false);
    });
});

describe("space inputs", () => {
    it("keeps the thumbnail out of the update body, it goes by multipart", () => {
        const parsed = SpaceUpdateSchema.parse({
            name: "Lobby",
            thumbnailUrl: "https://cdn.test/photo.png",
        });

        expect(parsed).not.toHaveProperty("thumbnailUrl");
    });

    it("keeps the thumbnail out of the create body", () => {
        const parsed = SpaceDataSchema.parse({
            name: "Lobby",
            templateId: "template-1",
            thumbnailUrl: "https://cdn.test/photo.png",
        });

        expect(parsed).not.toHaveProperty("thumbnailUrl");
    });
});

describe("SpaceDetailsSchema", () => {
    it("requires the thumbnail url, null when there is none", () => {
        const shape = SpaceDetailsSchema.shape;

        expect(shape.thumbnailUrl.safeParse(null).success).toBe(true);
        expect(shape.thumbnailUrl.safeParse("https://cdn.test/a.png").success).toBe(
            true
        );
        expect(shape.thumbnailUrl.safeParse(undefined).success).toBe(false);
    });
});
