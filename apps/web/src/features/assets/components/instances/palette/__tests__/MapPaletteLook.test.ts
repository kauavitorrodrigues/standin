import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PALETTE_LOOKS } from "@/features/assets/consts/paletteLooks";
import { MapPalette } from "../MapPalette";

// The thumbnails pull in the api client, which needs the env.
vi.mock("@/lib/api/assetUrl", () => ({ resolveFileUrl: (url: string) => url }));
vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "" }));

type Categories = Parameters<typeof MapPalette>[0]["categories"];

const categories = [
    {
        category: "FURNITURE",
        label: "Móveis",
        icon: "armchair",
        order: 1,
        families: [
            {
                id: "chair",
                name: "Cadeira azul",
                url: "chair.png",
                sprite: { w: 32, h: 32 },
            },
        ],
    },
] as unknown as Categories;

const render = (props: Partial<Parameters<typeof MapPalette>[0]> = {}) =>
    renderToStaticMarkup(
        createElement(
            TooltipProvider,
            null,
            createElement(MapPalette, {
                tilesets: [],
                categories,
                onPick: () => {},
                hideTilesTab: true,
                ...props,
            })
        )
    );

describe("MapPalette look", () => {
    it("shows the name of each family, the magnifier and its own placeholder by default", () => {
        const html = render();

        expect(html).toContain('placeholder="Buscar peça"');
        expect(html).toContain("lucide-search");
        expect(html).toContain("line-clamp-2");
    });

    it("shows only the pictures in the decorator look, and keeps the name for screen readers", () => {
        const html = render({
            look: PALETTE_LOOKS.DECORATOR,
            searchPlaceholder: "Buscar decoração",
        });

        expect(html).toContain('placeholder="Buscar decoração"');
        expect(html).not.toContain("lucide-search");
        expect(html).not.toContain("line-clamp-2");
        expect(html).toContain("sr-only");
        expect(html).toContain("Cadeira azul");
    });

    it("keeps the category tabs", () => {
        expect(render({ look: PALETTE_LOOKS.DECORATOR })).toContain("Móveis");
    });
});
