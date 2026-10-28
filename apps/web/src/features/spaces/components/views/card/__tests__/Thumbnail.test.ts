// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiBase = vi.hoisted(() => ({ url: "http://localhost:3001" }));
vi.mock("@/lib/api/url", () => ({
    get API_BASE_URL() {
        return apiBase.url;
    },
}));

import { Thumbnail } from "../Thumbnail";

let host: HTMLDivElement;
let root: Root;

const render = (url: string | null) =>
    act(() => root.render(createElement(Thumbnail, { url })));

describe("Thumbnail", () => {
    beforeEach(() => {
        apiBase.url = "http://localhost:3001";
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        host = document.createElement("div");
        root = createRoot(host);
    });
    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
    });

    it("renders nothing without a photo, so the gradient shows", () => {
        render(null);

        expect(host.innerHTML).toBe("");
    });

    it("renders the photo filling the card", () => {
        render("https://cdn/photo.png");

        const image = host.querySelector("img")!;
        expect(image.getAttribute("src")).toBe("https://cdn/photo.png");
        expect(image.className).toContain("absolute");
        expect(image.className).toContain("object-cover");
    });

    it("is decorative, the name under the card says what it is", () => {
        render("https://cdn/photo.png");

        expect(host.querySelector("img")!.getAttribute("alt")).toBe("");
    });

    it("rebases a file of the API onto the page origin in LAN mode", () => {
        apiBase.url = "/api";

        render("http://localhost:3001/public/spaces/s1/thumbnail.png");

        expect(host.querySelector("img")!.getAttribute("src")).toBe(
            "/api/public/spaces/s1/thumbnail.png"
        );
    });

    it("keeps the address of a file in external storage", () => {
        apiBase.url = "/api";

        render("https://cdn.test/spaces/s1/thumbnail.png");

        expect(host.querySelector("img")!.getAttribute("src")).toBe(
            "https://cdn.test/spaces/s1/thumbnail.png"
        );
    });

    it("gives way to the gradient when the image does not load", () => {
        render("https://cdn/photo.png");

        act(() => {
            host.querySelector("img")!.dispatchEvent(new Event("error"));
        });

        expect(host.querySelector("img")).toBeNull();
    });

    it("tries again when the photo is replaced after a failure", () => {
        render("https://cdn/old.png");
        act(() => {
            host.querySelector("img")!.dispatchEvent(new Event("error"));
        });

        render("https://cdn/new.png");

        expect(host.querySelector("img")!.getAttribute("src")).toBe(
            "https://cdn/new.png"
        );
    });
});
