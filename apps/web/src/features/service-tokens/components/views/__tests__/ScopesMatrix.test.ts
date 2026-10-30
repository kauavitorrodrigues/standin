import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { ScopesMatrix } from "../ScopesMatrix";

type Value = Parameters<typeof ScopesMatrix>[0]["value"];

const render = (value: Value, disabled?: boolean) =>
    renderToStaticMarkup(
        createElement(ScopesMatrix, {
            value,
            onChange: () => undefined,
            disabled,
        })
    );

// The attribute of a disabled element; the classes also say "disabled:".
const DISABLED = /\sdisabled=""|aria-disabled="true"/;

// The opening tag of the button with this text.
const buttonTag = (html: string, text: string) =>
    html.match(new RegExp(`<button[^>]*>(?:(?!</button>).)*${text}`))?.[0];

describe("ScopesMatrix", () => {
    it("draws a row per resource and a column per action", () => {
        const html = render([]);
        for (const text of [
            "Recurso",
            "Leitura",
            "Escrita",
            "Biblioteca",
            "Mapas",
            "Modelos de mapa",
        ]) {
            expect(html).toContain(text);
        }
    });

    it("has a checkbox per scope, per column and per row", () => {
        const html = render([]);
        const columns = 2;
        const rows = 3;
        expect(html.match(/role="checkbox"/g)).toHaveLength(
            SERVICE_TOKEN_SCOPES.length + columns + rows
        );
        expect(html).toContain(
            '<span class="sr-only">Leitura em todos os recursos</span>'
        );
        expect(html).toContain(
            '<span class="sr-only">Escrita em todos os recursos</span>'
        );
        expect(html).toContain(
            '<span class="sr-only">Todas as permissões de Mapas</span>'
        );
    });

    it("names a cell by its description, with the hint for a scope without route", () => {
        const html = render([]);
        expect(html).toContain('aria-label="Consultar mapas"');
        expect(html).toContain(
            'aria-label="Consultar modelos de mapa (em breve)"'
        );
        expect(html).toContain('aria-label="Alterar biblioteca (em breve)"');
    });

    it("shows the hint next to the cells no route accepts yet", () => {
        const html = render([]);
        expect(html.match(/\(em breve\)<\/span>/g)).toHaveLength(3);
    });

    it("disables Limpar when nothing is selected and Tudo when all are", () => {
        expect(buttonTag(render([]), "Limpar")).toMatch(DISABLED);
        expect(buttonTag(render([]), "Tudo")).not.toMatch(DISABLED);
        expect(buttonTag(render([...SERVICE_TOKEN_SCOPES]), "Tudo")).toContain(
            "disabled"
        );
        expect(
            buttonTag(render([...SERVICE_TOKEN_SCOPES]), "Limpar")
        ).not.toMatch(DISABLED);
    });

    it("disables every checkbox and button when the field is disabled", () => {
        const html = render(["maps:read"], true);
        const checkboxes = html.match(/<span[^>]*role="checkbox"[^>]*>/g) ?? [];
        const buttons = html.match(/<button[^>]*>/g) ?? [];
        expect(checkboxes.length).toBeGreaterThan(0);
        expect(buttons).toHaveLength(3);
        for (const tag of [...checkboxes, ...buttons]) {
            expect(tag).toMatch(DISABLED);
        }
    });

    it("counts the selected permissions and offers the three buttons", () => {
        const html = render(["maps:read", "maps:write"]);
        expect(html).toContain("2 de 6 permissões");
        expect(html).toContain("Somente leitura");
        expect(html).toContain("Tudo");
        expect(html).toContain("Limpar");
    });

    it("marks a partly selected row as indeterminate and a full one as checked", () => {
        const partly = render(["maps:read"]);
        expect(partly).toContain('data-indeterminate=""');

        const full = render([...SERVICE_TOKEN_SCOPES]);
        expect(full).toContain('data-checked=""');
        expect(full).not.toContain('data-indeterminate=""');
        expect(full).toContain("6 de 6 permissões");
    });
});
