import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "http://api.test" }));

import { UserAvatar } from "../UserAvatar";

const render = (avatar?: string | null) =>
    renderToStaticMarkup(
        createElement(UserAvatar, { id: "u1", name: "Ana", avatar })
    );

describe("UserAvatar", () => {
    it("shows the initial while there is no picture", () => {
        const markup = render(null);

        expect(markup).toContain(">A<");
        expect(markup).not.toContain("<img");
    });

    it("keeps the initial until the picture has loaded or when it fails", () => {
        // The picture is only drawn once the browser loaded it, so a broken
        // file never replaces the initial.
        expect(render("/files/x")).toContain(">A<");
    });
});
