import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useForm } from "react-hook-form";
import { BrickWallIcon } from "lucide-react";
import { describe, expect, it } from "vitest";
import { SwitchCardField } from "../SwitchCardField";

type Values = { on: boolean };

const Card = ({ on }: { on: boolean }) => {
    const form = useForm<Values>({ defaultValues: { on } });

    return createElement(
        SwitchCardField<Values, "on">,
        {
            control: form.control,
            name: "on",
            icon: BrickWallIcon,
            title: "Animada",
            description: "Descrição",
        },
        createElement("span", null, "campos")
    );
};

describe("SwitchCardField", () => {
    it("draws the line and the fields only while the switch is on", () => {
        const off = renderToStaticMarkup(createElement(Card, { on: false }));
        expect(off).not.toContain("border-t pt-4");
        expect(off).not.toContain("campos");

        const on = renderToStaticMarkup(createElement(Card, { on: true }));
        expect(on).toContain("border-t pt-4");
        expect(on).toContain("campos");
    });
});
