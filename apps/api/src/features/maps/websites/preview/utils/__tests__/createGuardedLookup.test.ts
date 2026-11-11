import { describe, expect, it, vi } from "vitest";
import { WebsitePreviewBlockedAddressError } from "@standin/contracts";
import { createGuardedLookup } from "../createGuardedLookup";

const run = (
    addresses: { address: string; family: number }[],
    all = false
): Promise<{ error: unknown; address: unknown; family: unknown }> =>
    new Promise((resolve) => {
        const lookup = createGuardedLookup(() => Promise.resolve(addresses));
        lookup("example.com", { all }, (error, address, family) =>
            resolve({ error, address, family })
        );
    });

describe("createGuardedLookup", () => {
    it("gives the address of a public name", async () => {
        const result = await run([{ address: "93.184.216.34", family: 4 }]);
        expect(result).toEqual({
            error: null,
            address: "93.184.216.34",
            family: 4,
        });
    });

    it("gives every address when the connection asks for all", async () => {
        const addresses = [
            { address: "93.184.216.34", family: 4 },
            { address: "2606:4700:4700::1111", family: 6 },
        ];
        const result = await run(addresses, true);
        expect(result.address).toEqual(addresses);
    });

    it("refuses a name that resolves to a private address", async () => {
        const result = await run([{ address: "10.0.0.5", family: 4 }]);
        expect(result.error).toBeInstanceOf(WebsitePreviewBlockedAddressError);
    });

    it("refuses a name when only one of its addresses is private", async () => {
        const result = await run([
            { address: "93.184.216.34", family: 4 },
            { address: "127.0.0.1", family: 4 },
        ]);
        expect(result.error).toBeInstanceOf(WebsitePreviewBlockedAddressError);
    });

    it("refuses a name that resolves to nothing", async () => {
        const result = await run([]);
        expect(result.error).toBeInstanceOf(WebsitePreviewBlockedAddressError);
    });

    it("passes on the error of the resolver", async () => {
        const failure = Object.assign(new TypeError("down"), {
            code: "ENOTFOUND",
        });
        const callback = vi.fn();
        createGuardedLookup(() => Promise.reject(failure))(
            "example.com",
            {},
            callback
        );
        await vi.waitFor(() => expect(callback).toHaveBeenCalled());
        expect(callback.mock.calls[0]?.[0]).toBe(failure);
    });
});
