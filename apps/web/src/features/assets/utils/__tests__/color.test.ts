import { describe, expect, it } from "vitest";
import { getDominantColor } from "../getDominantColor";
import { nameColor } from "../nameColor";

const pixel = (r: number, g: number, b: number, a = 255) => [r, g, b, a];

describe("getDominantColor", () => {
    it("is the color most pixels share", () => {
        const data = [
            ...pixel(0, 200, 0),
            ...pixel(0, 202, 2),
            ...pixel(200, 0, 0),
        ];
        expect(getDominantColor(data)).toBe("#00C901");
    });

    it("ignores transparent pixels", () => {
        const data = [...pixel(255, 0, 0, 0), ...pixel(0, 0, 255)];
        expect(getDominantColor(data)).toBe("#0000FF");
    });

    it("is null when nothing is visible", () => {
        expect(getDominantColor(pixel(1, 2, 3, 0))).toBeNull();
    });
});

describe("nameColor", () => {
    it("picks the closest name", () => {
        expect(nameColor("#00C901")).toBe("verde");
        expect(nameColor("#1D4ED8")).toBe("azul");
    });
});
