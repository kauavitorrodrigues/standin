import { describe, expect, it } from "vitest";
import { describeRaisedHand } from "../describeRaisedHand";

describe("describeRaisedHand", () => {
    it("shows the person with their avatar and what they did", () => {
        expect(
            describeRaisedHand("ana", {
                id: "ana",
                name: "Ana",
                profilePictureUrl: "/files/ana",
            })
        ).toEqual({
            title: "Ana",
            description: "levantou a mão",
            type: "info",
            data: { avatar: { id: "ana", name: "Ana", src: "/files/ana" } },
        });
    });

    it("falls back when the person is not known", () => {
        const toast = describeRaisedHand("ghost", undefined);

        expect(toast.title).toBe("Alguém");
        expect(toast.data.avatar).toEqual({
            id: "ghost",
            name: "Alguém",
            src: null,
        });
    });
});
