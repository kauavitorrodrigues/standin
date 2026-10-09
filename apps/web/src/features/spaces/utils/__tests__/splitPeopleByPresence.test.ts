import { describe, expect, it } from "vitest";
import type { UserSummary } from "@standin/contracts";
import { splitPeopleByPresence } from "../splitPeopleByPresence";

const person = (id: string, name: string) =>
    ({ id, name, avatarUrl: null }) as UserSummary;

const people = [person("1", "Kauã"), person("2", "Teste"), person("3", "Ana")];

describe("splitPeopleByPresence", () => {
    it("splits by presence and sorts each group by name", () => {
        const { online, offline } = splitPeopleByPresence(
            people,
            ["2", "1"],
            ""
        );

        expect(online.map((p) => p.id)).toEqual(["1", "2"]);
        expect(offline.map((p) => p.id)).toEqual(["3"]);
    });

    it("filters by name ignoring case and accents", () => {
        const { online, offline } = splitPeopleByPresence(
            people,
            ["1"],
            " KAUA "
        );

        expect(online.map((p) => p.id)).toEqual(["1"]);
        expect(offline).toEqual([]);
    });
});
