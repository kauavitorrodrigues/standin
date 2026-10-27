import { describe, expect, it } from "vitest";
import { formatTable } from "../formatTable";

describe("formatTable", () => {
    it("pads each column to its widest cell", () => {
        const table = formatTable(["N", "msg/s"], [["10", "5"], ["100", "12345"]]);
        expect(table.split("\n")).toEqual([
            "  N  msg/s",
            "---  -----",
            " 10      5",
            "100  12345",
        ]);
    });
});
