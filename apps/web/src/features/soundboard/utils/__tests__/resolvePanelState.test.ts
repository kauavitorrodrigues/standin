import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import { resolvePanelState } from "../resolvePanelState";
import { makeClips, makeGroup } from "./clipFixtures";

const ORG = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;
const DEFAULT = SOUNDBOARD_CLIP_SCOPES.DEFAULT;

describe("resolvePanelState", () => {
    it("lists the groups when one has clips", () => {
        expect(
            resolvePanelState(
                [makeGroup(ORG), makeGroup(DEFAULT, { clips: makeClips(1) })],
                false
            )
        ).toBe("groups");
    });

    it("is empty when neither has clips", () => {
        expect(
            resolvePanelState([makeGroup(ORG), makeGroup(DEFAULT)], false)
        ).toBe("empty");
    });

    it("is no results when neither matches an active search", () => {
        expect(
            resolvePanelState([makeGroup(ORG), makeGroup(DEFAULT)], true)
        ).toBe("no-results");
    });

    it("is not empty while a group still loads or has failed", () => {
        expect(
            resolvePanelState(
                [makeGroup(ORG, { isLoading: true }), makeGroup(DEFAULT)],
                false
            )
        ).toBe("groups");
        expect(
            resolvePanelState(
                [makeGroup(ORG, { isError: true }), makeGroup(DEFAULT)],
                true
            )
        ).toBe("groups");
    });
});
