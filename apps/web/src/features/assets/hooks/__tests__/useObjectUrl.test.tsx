import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useObjectUrl } from "../useObjectUrl";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const file = (name: string) => new File(["x"], name);

describe("useObjectUrl", () => {
    let created: string[];
    let revoked: string[];
    let seen: (string | undefined)[];

    const Probe = ({ value }: { value: File | undefined }) => {
        seen.push(useObjectUrl(value));
        return null;
    };

    beforeEach(() => {
        created = [];
        revoked = [];
        seen = [];
        let counter = 0;
        URL.createObjectURL = vi.fn(() => {
            const url = `blob:${++counter}`;
            created.push(url);
            return url;
        });
        URL.revokeObjectURL = vi.fn((url: string) => {
            revoked.push(url);
        });
    });

    afterEach(() => vi.restoreAllMocks());

    const mount = async (value: File | undefined) => {
        const root = createRoot(document.createElement("div"));
        await act(async () => root.render(createElement(Probe, { value })));
        return root;
    };

    it("makes the URL after the render and revokes it on unmount", async () => {
        const root = await mount(file("a.png"));

        expect(created).toEqual(["blob:1"]);
        expect(seen.at(-1)).toBe("blob:1");

        await act(async () => root.unmount());

        expect(revoked).toEqual(["blob:1"]);
    });

    it("revokes the old URL when the file changes", async () => {
        const root = await mount(file("a.png"));

        await act(async () =>
            root.render(createElement(Probe, { value: file("b.png") }))
        );

        expect(revoked).toEqual(["blob:1"]);
        expect(seen.at(-1)).toBe("blob:2");
        await act(async () => root.unmount());
    });

    it("makes no URL without a file", async () => {
        const root = await mount(undefined);

        expect(created).toEqual([]);
        expect(seen.at(-1)).toBeUndefined();
        await act(async () => root.unmount());
    });
});
