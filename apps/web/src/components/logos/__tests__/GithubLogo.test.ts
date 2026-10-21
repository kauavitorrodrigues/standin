import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GithubLogo, GithubLogoIcon } from "..";

// GitHub allows its logo only in black or white, so both are painted with the
// text color and follow the theme. They must never carry a color of their own.
describe.each([
    ["GithubLogoIcon", GithubLogoIcon, "0 0 98 96"],
    ["GithubLogo", GithubLogo, "0 0 416 95"],
])("%s", (_name, Logo, viewBox) => {
    const markup = renderToStaticMarkup(createElement(Logo));

    it("is named GitHub for screen readers", () => {
        expect(markup).toContain('role="img"');
        expect(markup).toContain("<title>GitHub</title>");
    });

    it("keeps the official box and paints with the text color", () => {
        expect(markup).toContain(`viewBox="${viewBox}"`);
        expect(markup).toContain('fill="currentColor"');
    });

    it("has no color of its own on the paths", () => {
        expect(markup).not.toMatch(/<path[^>]*fill="/);
    });

    it("takes the class of the place it is used in", () => {
        const custom = renderToStaticMarkup(
            createElement(Logo, { className: "size-8 text-white" })
        );

        expect(custom).toContain("size-8");
        expect(custom).toContain("text-white");
    });
});
