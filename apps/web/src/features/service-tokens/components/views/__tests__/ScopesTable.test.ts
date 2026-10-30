import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { SERVICE_TOKEN_SCOPE_META } from "../../../consts/scopes";
import { ScopesTable } from "../ScopesTable";

describe("ScopesTable", () => {
    it("draws one row with a checkbox for every scope", () => {
        const html = renderToStaticMarkup(
            createElement(ScopesTable, {
                value: ["maps:write"],
                onChange: () => undefined,
            })
        );
        for (const scope of SERVICE_TOKEN_SCOPES) {
            expect(html).toContain(SERVICE_TOKEN_SCOPE_META[scope].label);
        }
        expect(html.match(/role="checkbox"/g)).toHaveLength(
            SERVICE_TOKEN_SCOPES.length
        );
        expect(html).toContain("Recurso");
    });
});
