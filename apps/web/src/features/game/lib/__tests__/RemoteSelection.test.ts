import { describe, expect, it, vi } from "vitest";
import { RemoteSelection } from "../RemoteSelection";

const avatars = () => {
    const a = { setNameTagDetailed: vi.fn() };
    const b = { setNameTagDetailed: vi.fn() };
    const map = new Map([
        ["a", a],
        ["b", b],
    ]);
    return { a, b, find: (id: string) => map.get(id) };
};

describe("RemoteSelection", () => {
    it("selects an avatar and shows its detail", () => {
        const { a, find } = avatars();
        const selection = new RemoteSelection();

        selection.select("a", find);

        expect(selection.id).toBe("a");
        expect(a.setNameTagDetailed).toHaveBeenCalledWith(true);
    });

    it("lets the first one go when another is selected", () => {
        const { a, b, find } = avatars();
        const selection = new RemoteSelection();
        selection.select("a", find);

        selection.select("b", find);

        expect(a.setNameTagDetailed).toHaveBeenLastCalledWith(false);
        expect(b.setNameTagDetailed).toHaveBeenCalledWith(true);
        expect(selection.id).toBe("b");
    });

    it("lets go with a click on nothing", () => {
        const { a, find } = avatars();
        const selection = new RemoteSelection();
        selection.select("a", find);

        selection.select(null, find);

        expect(a.setNameTagDetailed).toHaveBeenLastCalledWith(false);
        expect(selection.id).toBeNull();
    });

    it("does nothing when the same avatar is clicked again", () => {
        const { a, find } = avatars();
        const selection = new RemoteSelection();
        selection.select("a", find);
        a.setNameTagDetailed.mockClear();

        selection.select("a", find);

        expect(a.setNameTagDetailed).not.toHaveBeenCalled();
    });

    it("forgets an avatar that left, without touching it", () => {
        const { a, find } = avatars();
        const selection = new RemoteSelection();
        selection.select("a", find);
        a.setNameTagDetailed.mockClear();

        selection.remove("a");

        expect(selection.id).toBeNull();
        expect(a.setNameTagDetailed).not.toHaveBeenCalled();
    });

    it("keeps the selection when another avatar leaves", () => {
        const { find } = avatars();
        const selection = new RemoteSelection();
        selection.select("a", find);

        selection.remove("b");

        expect(selection.id).toBe("a");
    });

    it("does not fail when the selected avatar is no longer there", () => {
        const selection = new RemoteSelection();
        selection.select("gone", () => undefined);

        expect(() => selection.select(null, () => undefined)).not.toThrow();
    });
});
