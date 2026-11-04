import { describe, expect, it } from "vitest";
import type { UserSummary } from "@standin/contracts";
import { buildMentionCandidates } from "../buildMentionCandidates";

const person = (id: string, name: string) =>
    ({ id, name, profilePictureUrl: null }) as UserSummary;

const members = [
    person("1", "Zélia"),
    person("2", "Ana"),
    person("3", "Bruno"),
    person("4", "Eu"),
];

describe("buildMentionCandidates", () => {
    it("puts people in the space first, each group by name", () => {
        const result = buildMentionCandidates({
            members,
            onlineUserIds: ["1", "3"],
            selfUserId: "4",
            query: "",
        });
        expect(result.map(({ user }) => user.name)).toEqual([
            "Bruno",
            "Zélia",
            "Ana",
        ]);
        expect(result.map(({ isOnline }) => isOnline)).toEqual([
            true,
            true,
            false,
        ]);
    });

    it("never offers the person who is writing", () => {
        const result = buildMentionCandidates({
            members,
            onlineUserIds: ["4"],
            selfUserId: "4",
            query: "",
        });
        expect(result.some(({ user }) => user.id === "4")).toBe(false);
    });

    it("filters by what was typed, ignoring accents and case", () => {
        const result = buildMentionCandidates({
            members,
            onlineUserIds: [],
            selfUserId: "4",
            query: "zeli",
        });
        expect(result.map(({ user }) => user.name)).toEqual(["Zélia"]);
    });

    it("gives nothing when nobody matches", () => {
        expect(
            buildMentionCandidates({
                members,
                onlineUserIds: [],
                selfUserId: "4",
                query: "xyz",
            })
        ).toEqual([]);
    });
});
