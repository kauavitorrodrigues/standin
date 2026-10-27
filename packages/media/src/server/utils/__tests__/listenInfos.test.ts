import { describe, expect, it } from "vitest";
import { buildListenInfos } from "../buildListenInfos";
import { localAddresses } from "../localAddresses";

const base = { listenIp: "0.0.0.0", listenPort: 44444 };

describe("buildListenInfos", () => {
    it("listens on every real address when nothing is announced, so no 0.0.0.0 is sent to a browser", () => {
        const infos = buildListenInfos(base, () => [
            "127.0.0.1",
            "192.168.0.10",
        ]);
        expect(infos.map((info) => `${info.protocol}:${info.ip}`)).toEqual([
            "udp:127.0.0.1",
            "tcp:127.0.0.1",
            "udp:192.168.0.10",
            "tcp:192.168.0.10",
        ]);
        expect(infos.every((info) => info.announcedAddress === undefined)).toBe(
            true
        );
    });

    it("announces the public address when one is configured", () => {
        const infos = buildListenInfos({
            ...base,
            announcedAddress: "203.0.113.7",
        });
        expect(infos).toHaveLength(2);
        expect(
            infos.every((info) => info.announcedAddress === "203.0.113.7")
        ).toBe(true);
        expect(infos.every((info) => info.ip === "0.0.0.0")).toBe(true);
    });

    it("keeps one specific address as it is", () => {
        const infos = buildListenInfos({ ...base, listenIp: "10.0.0.5" });
        expect(infos.map((info) => info.ip)).toEqual(["10.0.0.5", "10.0.0.5"]);
    });
});

describe("localAddresses", () => {
    it("lists the loopback and the real IPv4 addresses once each, without Docker bridges", () => {
        const addresses = localAddresses({
            eth0: [
                { address: "192.168.0.10", family: "IPv4", internal: false },
                { address: "fe80::1", family: "IPv6", internal: false },
            ],
            lo: [{ address: "127.0.0.1", family: "IPv4", internal: true }],
            docker0: [
                { address: "192.168.0.10", family: "IPv4", internal: false },
            ],
        } as never);
        expect(addresses).toEqual(["127.0.0.1", "192.168.0.10"]);
    });
});
