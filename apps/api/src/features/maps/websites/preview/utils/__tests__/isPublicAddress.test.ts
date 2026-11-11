import { describe, expect, it } from "vitest";
import { isPublicAddress } from "../isPublicAddress";

describe("isPublicAddress", () => {
    it.each([
        "8.8.8.8",
        "1.1.1.1",
        "93.184.216.34",
        "2606:4700:4700::1111",
        "2a00:1450:4001:81b::200e",
    ])("lets %s through", (address) => {
        expect(isPublicAddress(address)).toBe(true);
    });

    it.each([
        ["loopback", "127.0.0.1"],
        ["loopback range", "127.255.255.254"],
        ["this network", "0.0.0.0"],
        ["private 10", "10.1.2.3"],
        ["private 172", "172.16.0.1"],
        ["private 172 end", "172.31.255.255"],
        ["private 192", "192.168.1.10"],
        ["link-local and cloud metadata", "169.254.169.254"],
        ["carrier grade", "100.64.0.1"],
        ["benchmark", "198.18.0.1"],
        ["multicast", "224.0.0.1"],
        ["broadcast", "255.255.255.255"],
        ["ipv6 loopback", "::1"],
        ["ipv6 unspecified", "::"],
        ["ipv6 unique local", "fd12:3456:789a::1"],
        ["ipv6 link-local", "fe80::1"],
        ["ipv6 multicast", "ff02::1"],
        ["ipv4 mapped loopback", "::ffff:127.0.0.1"],
        ["ipv4 mapped loopback in hex", "::ffff:7f00:1"],
        ["ipv4 mapped metadata", "::ffff:169.254.169.254"],
        ["nat64", "64:ff9b::7f00:1"],
        ["6to4", "2002:7f00:1::"],
    ])("refuses %s (%s)", (_name, address) => {
        expect(isPublicAddress(address)).toBe(false);
    });

    it("does not trust the edge of a private range", () => {
        expect(isPublicAddress("172.15.255.255")).toBe(true);
        expect(isPublicAddress("172.32.0.0")).toBe(true);
    });

    it.each(["localhost", "", "not an address", "999.1.1.1"])(
        "refuses %j, which is no address",
        (value) => {
            expect(isPublicAddress(value)).toBe(false);
        }
    );
});
