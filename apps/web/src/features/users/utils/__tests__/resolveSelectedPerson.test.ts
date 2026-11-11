import { describe, expect, it } from "vitest";
import type { UserSummary } from "@standin/contracts";
import { resolveSelectedPerson } from "../resolveSelectedPerson";

const ana = { id: "ana", name: "Ana" } as UserSummary;
const people = new Map([[ana.id, ana]]);

describe("resolveSelectedPerson", () => {
    it("gives the person whose avatar was clicked", () => {
        expect(resolveSelectedPerson("ana", "me", people)).toBe(ana);
    });

    it("gives nothing with no selection", () => {
        expect(resolveSelectedPerson(null, "me", people)).toBeNull();
    });

    it("gives nothing for the own account, which the own profile covers", () => {
        expect(resolveSelectedPerson("ana", "ana", people)).toBeNull();
    });

    it("gives nothing for a person the organization does not list", () => {
        expect(resolveSelectedPerson("guest", "me", people)).toBeNull();
    });
});
