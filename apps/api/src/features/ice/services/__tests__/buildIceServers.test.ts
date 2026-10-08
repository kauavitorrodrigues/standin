import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
    buildIceServers,
    buildTurnCredentials,
    DEFAULT_TURN_PORT,
    DEFAULT_TURN_TTL_SECONDS,
    readIceServersConfig,
} from "../buildIceServers";

const NOW_MS = 1_700_000_000_000;
const NOW_SECONDS = 1_700_000_000;

describe("buildTurnCredentials", () => {
    it("puts the expiry and the user id in the username", () => {
        const { username } = buildTurnCredentials("user-1", "s3cret", 3600, NOW_MS);
        expect(username).toBe(`${NOW_SECONDS + 3600}:user-1`);
    });

    it("signs the username with HMAC-SHA1 in base64, as coturn expects", () => {
        const { username, credential } = buildTurnCredentials(
            "user-1",
            "s3cret",
            3600,
            NOW_MS
        );

        const expected = createHmac("sha1", "s3cret")
            .update(username)
            .digest("base64");
        expect(credential).toBe(expected);
    });

    it("matches a known vector", () => {
        // Computed independently with:
        // printf '1700003600:u' | openssl dgst -sha1 -hmac secret -binary | base64
        const { username, credential } = buildTurnCredentials(
            "u",
            "secret",
            3600,
            NOW_MS
        );

        expect(username).toBe("1700003600:u");
        expect(credential).toBe("ErsUKHUUAEQbERD6TOOXKvwwfds=");
    });

    it("produces different credentials for different users and secrets", () => {
        const a = buildTurnCredentials("a", "s", 60, NOW_MS);
        const b = buildTurnCredentials("b", "s", 60, NOW_MS);
        const c = buildTurnCredentials("a", "other", 60, NOW_MS);

        expect(a.credential).not.toBe(b.credential);
        expect(a.credential).not.toBe(c.credential);
    });

    it("expires exactly ttlSeconds after now", () => {
        const short = buildTurnCredentials("a", "s", 10, NOW_MS).username;
        const long = buildTurnCredentials("a", "s", 100, NOW_MS).username;

        expect(Number(short.split(":")[0])).toBe(NOW_SECONDS + 10);
        expect(Number(long.split(":")[0])).toBe(NOW_SECONDS + 100);
    });
});

describe("buildIceServers", () => {
    const config = {
        host: "turn.example.com",
        secret: "s3cret",
        ttlSeconds: 3600,
        port: 3478,
    };

    it("returns no servers when TURN is not configured", () => {
        expect(buildIceServers("user-1", null, NOW_MS)).toEqual([]);
    });

    it("returns a STUN entry and a TURN entry with credentials", () => {
        const servers = buildIceServers("user-1", config, NOW_MS);

        expect(servers).toHaveLength(2);
        expect(servers[0]).toEqual({ urls: "stun:turn.example.com:3478" });
        expect(servers[1]).toMatchObject({
            urls: [
                "turn:turn.example.com:3478?transport=udp",
                "turn:turn.example.com:3478?transport=tcp",
            ],
            username: `${NOW_SECONDS + 3600}:user-1`,
        });
        expect(servers[1].credential).toBeTruthy();
    });

    it("never includes the shared secret in the response", () => {
        const serialized = JSON.stringify(
            buildIceServers("user-1", config, NOW_MS)
        );
        expect(serialized).not.toContain("s3cret");
    });

    it("does not put credentials on the STUN entry", () => {
        const [stun] = buildIceServers("user-1", config, NOW_MS);
        expect(stun.username).toBeUndefined();
        expect(stun.credential).toBeUndefined();
    });
});

describe("readIceServersConfig", () => {
    it("is null unless both host and secret are set", () => {
        expect(readIceServersConfig({})).toBeNull();
        expect(readIceServersConfig({ TURN_HOST: "h" })).toBeNull();
        expect(readIceServersConfig({ TURN_SECRET: "s" })).toBeNull();
    });

    it("applies defaults for ttl and port", () => {
        expect(
            readIceServersConfig({ TURN_HOST: "h", TURN_SECRET: "s" })
        ).toEqual({
            host: "h",
            secret: "s",
            ttlSeconds: DEFAULT_TURN_TTL_SECONDS,
            port: DEFAULT_TURN_PORT,
        });
    });

    it("reads valid numeric overrides and ignores invalid ones", () => {
        expect(
            readIceServersConfig({
                TURN_HOST: "h",
                TURN_SECRET: "s",
                TURN_TTL_SECONDS: "120",
                TURN_PORT: "5000",
            })
        ).toMatchObject({ ttlSeconds: 120, port: 5000 });

        expect(
            readIceServersConfig({
                TURN_HOST: "h",
                TURN_SECRET: "s",
                TURN_TTL_SECONDS: "abc",
                TURN_PORT: "-1",
            })
        ).toMatchObject({
            ttlSeconds: DEFAULT_TURN_TTL_SECONDS,
            port: DEFAULT_TURN_PORT,
        });
    });
});
