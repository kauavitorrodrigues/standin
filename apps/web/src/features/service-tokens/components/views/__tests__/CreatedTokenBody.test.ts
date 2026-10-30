import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CreatedTokenBody } from "../CreatedTokenBody";

describe("CreatedTokenBody", () => {
    it("shows the clear token with the warning that it is seen once", () => {
        const html = renderToStaticMarkup(
            createElement(CreatedTokenBody, { token: "sit_secret-value" })
        );
        expect(html).toContain("sit_secret-value");
        expect(html).toContain("não será mostrado de novo");
    });
});
