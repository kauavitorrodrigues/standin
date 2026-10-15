import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PaletteTabs } from "../PaletteTabs";

// The families pull in the api client, which needs the env. They are not what
// is under test.
vi.mock("@/features/assets/components/views/palette/PaletteFamilies", () => ({
    PaletteFamilies: () => null,
}));

type Categories = Parameters<typeof PaletteTabs>[0]["categories"];

const categories = [
    {
        category: "FURNITURE",
        label: "Móveis",
        icon: "armchair",
        order: 1,
        families: [],
    },
] as unknown as Categories;

const render = (hideTilesTab?: boolean) =>
    renderToStaticMarkup(
        createElement(
            TooltipProvider,
            null,
            createElement(PaletteTabs, {
                categories,
                tilesets: [],
                onPick: () => {},
                hideTilesTab,
            })
        )
    );

describe("PaletteTabs hideTilesTab", () => {
    it("shows the Tiles tab by default", () => {
        expect(render()).toContain("Tiles");
    });

    it("leaves the Tiles tab out when asked, and keeps the categories", () => {
        const html = render(true);
        expect(html).not.toContain("Tiles");
        expect(html).toContain("Móveis");
    });
});
