import { describe, expect, it, vi } from "vitest";
import { createFakeHttp } from "../../testing/createFakeHttp";
import type {
    ApiCall,
    ApiForm,
    FetchFunction,
    HttpRequest,
    RemoteTarget,
} from "../../types";
import { buildForm } from "../buildForm";
import { buildRequest } from "../buildRequest";
import { callApi } from "../callApi";
import { createFetchTransport } from "../createFetchTransport";

const TARGET: RemoteTarget = {
    url: "https://standin.test",
    token: "sit_secret",
};
const PNG: Uint8Array = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
const FORM: ApiForm = {
    fields: { library: '{"tilesets":[]}' },
    files: [
        {
            name: "assets/café.png",
            fileName: "café.png",
            type: "image/png",
            bytes: PNG,
        },
    ],
};
const CALL: ApiCall = { method: "POST", path: "/library/seed", form: FORM };

describe("multipart calls", () => {
    it("builds the parts with the names as given", async () => {
        const data: FormData = buildForm(FORM);

        expect(data.get("library")).toBe('{"tilesets":[]}');
        const part = data.get("assets/café.png") as File;
        expect(part.type).toBe("image/png");
        expect(part.name).toBe("café.png");
        expect(new Uint8Array(await part.arrayBuffer())).toEqual(PNG);
    });

    it("keeps a non-ASCII part name as UTF-8 on the wire", async () => {
        const wire: string = await new Response(buildForm(FORM)).text();

        expect(wire).toContain('name="assets/café.png"');
    });

    it("sends the form without a content type and the token in the header only", () => {
        const request: HttpRequest = buildRequest(TARGET, CALL);

        expect(request.form).toBeInstanceOf(FormData);
        expect(request.body).toBeUndefined();
        expect(request.headers["content-type"]).toBeUndefined();
        expect(request.headers.authorization).toBe("Bearer sit_secret");
        expect(request.headers.accept).toBe("application/json");
        expect(request.url).not.toContain("sit_secret");
    });

    it("accepts PUT", async () => {
        const fake = createFakeHttp({
            "PUT /templates/t1/thumbnail": { status: 200, body: { ok: 1 } },
        });
        const answer = await callApi(fake.transport, TARGET, {
            method: "PUT",
            path: "/templates/t1/thumbnail",
            form: FORM,
        });

        expect(answer).toEqual({ ok: 1 });
        expect(fake.requests[0].method).toBe("PUT");
    });

    it("hands the form to fetch as the body, with no redirect followed", async () => {
        const fetchImpl = vi.fn<FetchFunction>(async () => new Response("{}"));
        const request: HttpRequest = buildRequest(TARGET, CALL);
        await createFetchTransport(fetchImpl)(request);

        const [, init] = fetchImpl.mock.calls[0];
        expect(init?.body).toBe(request.form);
        expect(init?.redirect).toBe("manual");
    });

    it("still answers with JSON only", async () => {
        const fake = createFakeHttp({
            "POST /library/seed": { status: 200, body: undefined },
        });

        await expect(
            callApi(fake.transport, TARGET, CALL)
        ).rejects.toMatchObject({
            code: "CLI_API_RESPONSE_INVALID",
        });
    });
});
