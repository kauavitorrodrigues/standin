import { describe, expect, it } from "vitest";
import type { ConversationSummary } from "@standin/contracts";
import { filterSummariesBySearch } from "../filterSummariesBySearch";

const direct = (id: string, ...names: string[]): ConversationSummary =>
    ({
        id,
        type: "DIRECT",
        spaceId: null,
        participants: names.map((name) => ({
            id: name,
            name,
            profilePictureUrl: null,
        })),
    }) as ConversationSummary;

const space = (id: string, spaceId: string): ConversationSummary =>
    ({
        id,
        type: "SPACE",
        spaceId,
        participants: [],
        lastMessage: null,
        unreadCount: 0,
    }) as ConversationSummary;

const spaceNames = new Map([["s1", "Escritório Central"]]);

describe("filterSummariesBySearch", () => {
    const all = [
        direct("d1", "José Álvares"),
        direct("d2", "Maria"),
        direct("d3", "Ana", "Joana"),
        space("c1", "s1"),
    ];

    it("matches participant names ignoring case and accents", () => {
        const ids = filterSummariesBySearch(all, spaceNames, "jose").map(
            (item) => item.id
        );
        expect(ids).toEqual(["d1"]);
    });

    it("matches any participant of a conversation", () => {
        const ids = filterSummariesBySearch(all, spaceNames, "JOAN").map(
            (item) => item.id
        );
        expect(ids).toEqual(["d3"]);
    });

    it("matches the space conversation by the space name", () => {
        const ids = filterSummariesBySearch(all, spaceNames, "escritorio").map(
            (item) => item.id
        );
        expect(ids).toEqual(["c1"]);
    });

    it("returns every conversation past the first 10 that matches", () => {
        const many = Array.from({ length: 25 }, (_, index) =>
            direct(`d${index}`, `Pessoa ${index}`)
        );
        expect(filterSummariesBySearch(many, spaceNames, "pessoa")).toHaveLength(
            25
        );
    });

    it("keeps everything for a blank search and nothing for no match", () => {
        expect(filterSummariesBySearch(all, spaceNames, "  ")).toHaveLength(4);
        expect(filterSummariesBySearch(all, spaceNames, "zzz")).toEqual([]);
    });
});
