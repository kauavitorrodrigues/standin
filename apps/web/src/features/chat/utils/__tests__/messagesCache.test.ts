import { describe, expect, it } from "vitest";
import type { MessageWithDetails } from "@standin/contracts";
import { prependMessage, type MessagesData } from "../messagesCache";

const message = { id: "m2", senderId: "ana" } as MessageWithDetails;

const data = (users: MessagesData["pages"][number]["users"]): MessagesData => ({
    pageParams: [undefined],
    pages: [
        {
            messages: [{ id: "m1", senderId: "ana" } as MessageWithDetails],
            users,
            nextCursor: null,
        },
    ],
});

describe("prependMessage", () => {
    it("adds the sender of a peer message when it is missing", () => {
        const sender = { id: "ana", name: "Ana", profilePictureUrl: null };

        const next = prependMessage(data({}), message, sender);

        expect(next.pages[0].users).toEqual({ ana: sender });
        expect(next.pages[0].messages[0]).toBe(message);
    });

    it("keeps the sender the server sent, with its picture", () => {
        const known = {
            id: "ana",
            name: "Ana",
            profilePictureUrl: "/files/f1",
        };

        const next = prependMessage(data({ ana: known }), message, {
            id: "ana",
            name: "Ana",
            profilePictureUrl: null,
        });

        expect(next.pages[0].users.ana).toBe(known);
    });

    it("does not insert the same message twice", () => {
        const current = data({});
        const again = { id: "m1", senderId: "ana" } as MessageWithDetails;

        expect(prependMessage(current, again)).toBe(current);
    });
});
