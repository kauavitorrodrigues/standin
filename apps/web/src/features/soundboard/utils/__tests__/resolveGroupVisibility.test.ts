import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import { resolveGroupVisibility } from "../resolveGroupVisibility";
import { makeClips, makeGroup } from "./clipFixtures";

const ORG = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;

describe("resolveGroupVisibility", () => {
    it("lists a group that has clips", () => {
        expect(
            resolveGroupVisibility(makeGroup(ORG, { clips: makeClips(1) }))
        ).toBe("listed");
    });

    it("hides a group known to have none", () => {
        expect(resolveGroupVisibility(makeGroup(ORG))).toBe("hidden");
    });

    it("does not know yet about a group that loads or failed", () => {
        expect(
            resolveGroupVisibility(makeGroup(ORG, { isLoading: true }))
        ).toBe("unknown");
        expect(resolveGroupVisibility(makeGroup(ORG, { isError: true }))).toBe(
            "unknown"
        );
    });
});
