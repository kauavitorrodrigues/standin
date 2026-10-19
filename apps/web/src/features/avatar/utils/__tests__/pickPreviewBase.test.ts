import { describe, expect, it } from "vitest";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type {
    AvatarBase,
    AvatarBaseGroup,
    AvatarBaseKind,
} from "@standin/contracts";
import { pickPreviewBase } from "../admin/pickPreviewBase";

const base = (
    id: string,
    kind: AvatarBaseKind,
    isDefault: boolean
): AvatarBase => ({
    id,
    key: id,
    name: id,
    kind,
    isDefault,
    url: `/files/${id}`,
    previewUrl: null,
    createdAt: "2026-10-14T10:00:00.000Z",
    deletedAt: null,
});

const { BODY, MANNEQUIN } = AVATAR_BASE_KINDS;

// The groups as the API sends them, both always there.
const groupsOf = (...bases: AvatarBase[]): AvatarBaseGroup[] =>
    [BODY, MANNEQUIN].map((kind) => ({
        kind,
        bases: bases.filter((item) => item.kind === kind),
    }));

describe("pickPreviewBase", () => {
    it("prefers the mannequin in use", () => {
        const bases = [
            base("body", BODY, true),
            base("other-mannequin", MANNEQUIN, false),
            base("mannequin", MANNEQUIN, true),
        ];

        expect(pickPreviewBase(groupsOf(...bases))?.id).toBe("mannequin");
    });

    it("falls back to the default body when no mannequin is in use", () => {
        const bases = [
            base("first", BODY, false),
            base("default", BODY, true),
            base("idle-mannequin", MANNEQUIN, false),
        ];

        expect(pickPreviewBase(groupsOf(...bases))?.id).toBe("default");
    });

    it("falls back to the first body when none is the default", () => {
        const bases = [
            base("idle-mannequin", MANNEQUIN, false),
            base("first", BODY, false),
            base("second", BODY, false),
        ];

        expect(pickPreviewBase(groupsOf(...bases))?.id).toBe("first");
    });

    it("never picks a mannequin that is not in use", () => {
        expect(
            pickPreviewBase(groupsOf(base("idle", MANNEQUIN, false)))
        ).toBeNull();
    });

    it("is null without bases", () => {
        expect(pickPreviewBase(groupsOf())).toBeNull();
    });
});
