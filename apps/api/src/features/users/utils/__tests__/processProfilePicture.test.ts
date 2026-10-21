import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
    PROFILE_PICTURE,
    ProfilePictureInvalidError,
    ProfilePictureTooLargeError,
} from "@standin/contracts";
import { processProfilePicture } from "../processProfilePicture";

type Rgb = [number, number, number];

const RED: Rgb = [255, 0, 0];
const BLUE: Rgb = [0, 0, 255];

// Left half red, right half blue, so a crop or a rotation is visible.
const twoToneRaw = (width: number, height: number): Buffer => {
    const data = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [r, g, b] = x < width / 2 ? RED : BLUE;
            const offset = (y * width + x) * 3;
            data[offset] = r;
            data[offset + 1] = g;
            data[offset + 2] = b;
        }
    }
    return data;
};

const twoTone = (width: number, height: number) =>
    sharp(twoToneRaw(width, height), { raw: { width, height, channels: 3 } });

const pixelAt = async (png: Buffer, x: number, y: number): Promise<Rgb> => {
    const { data, info } = await sharp(png)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const offset = (y * info.width + x) * info.channels;
    return [data[offset], data[offset + 1], data[offset + 2]];
};

const expectOutput = async (png: Buffer) => {
    const meta = await sharp(png).metadata();
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(PROFILE_PICTURE.outputSize);
    expect(meta.height).toBe(PROFILE_PICTURE.outputSize);
    expect(meta.exif).toBeUndefined();
    expect(meta.icc).toBeUndefined();
};

describe("processProfilePicture", () => {
    it("turns a PNG into a 256 x 256 PNG", async () => {
        const input = await twoTone(100, 100).png().toBuffer();

        await expectOutput(await processProfilePicture(input));
    });

    it("turns a JPEG into a 256 x 256 PNG", async () => {
        const input = await twoTone(120, 120).jpeg().toBuffer();

        await expectOutput(await processProfilePicture(input));
    });

    it("turns a WebP into a 256 x 256 PNG", async () => {
        const input = await twoTone(90, 90).webp().toBuffer();

        await expectOutput(await processProfilePicture(input));
    });

    it("accepts a large phone photo and centers it", async () => {
        const input = await twoTone(4000, 3000).jpeg().toBuffer();

        const output = await processProfilePicture(input);

        await expectOutput(output);
        // The center square spans x from 500 to 3500, so both halves show.
        const [leftRed] = await pixelAt(output, 10, 128);
        const [, , rightBlue] = await pixelAt(output, 245, 128);
        expect(leftRed).toBeGreaterThan(200);
        expect(rightBlue).toBeGreaterThan(200);
    });

    it("strips the metadata the file came with", async () => {
        const input = await twoTone(64, 64)
            .jpeg()
            .withMetadata({ exif: { IFD0: { Copyright: "secret" } } })
            .toBuffer();
        expect((await sharp(input).metadata()).exif).toBeDefined();

        const output = await processProfilePicture(input);

        expect((await sharp(output).metadata()).exif).toBeUndefined();
    });

    it("applies the EXIF orientation", async () => {
        // Stored 80 x 40 with orientation 6 (rotate 90 clockwise): it shows as
        // 40 x 80, so the left (red) half ends up on top.
        const input = await twoTone(80, 40)
            .jpeg({ quality: 100 })
            .withMetadata({ orientation: 6 })
            .toBuffer();

        const output = await processProfilePicture(input);

        await expectOutput(output);
        const [topRed] = await pixelAt(output, 128, 10);
        const [, , bottomBlue] = await pixelAt(output, 128, 245);
        expect(topRed).toBeGreaterThan(200);
        expect(bottomBlue).toBeGreaterThan(200);
    });

    it("keeps the center square of a wide image", async () => {
        // 300 x 100: the center square spans x from 100 to 200, so the red
        // left third and the blue right third are cut away and only a thin
        // strip of the middle shows. Paint the middle green to prove it.
        const width = 300;
        const height = 100;
        const data = Buffer.alloc(width * height * 3);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const offset = (y * width + x) * 3;
                const [r, g, b] =
                    x < 100 ? RED : x < 200 ? ([0, 255, 0] as Rgb) : BLUE;
                data[offset] = r;
                data[offset + 1] = g;
                data[offset + 2] = b;
            }
        }
        const input = await sharp(data, {
            raw: { width, height, channels: 3 },
        })
            .png()
            .toBuffer();

        const output = await processProfilePicture(input);

        await expectOutput(output);
        for (const [x, y] of [
            [2, 128],
            [128, 128],
            [253, 128],
            [128, 2],
        ]) {
            const [r, g, b] = await pixelAt(output, x, y);
            expect(g).toBeGreaterThan(200);
            expect(r).toBeLessThan(50);
            expect(b).toBeLessThan(50);
        }
    });

    it("keeps the center square of a tall image", async () => {
        const input = await twoTone(100, 300).png().toBuffer();

        const output = await processProfilePicture(input);

        await expectOutput(output);
        // The square is 100 x 100 from y 100 to 200 and keeps both halves.
        const [leftRed] = await pixelAt(output, 10, 128);
        const [, , rightBlue] = await pixelAt(output, 245, 128);
        expect(leftRed).toBeGreaterThan(200);
        expect(rightBlue).toBeGreaterThan(200);
    });

    it("refuses a GIF", async () => {
        const input = await twoTone(64, 64).gif().toBuffer();

        await expect(processProfilePicture(input)).rejects.toBeInstanceOf(
            ProfilePictureInvalidError
        );
    });

    it("refuses an SVG", async () => {
        const input = Buffer.from(
            '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64"/></svg>'
        );

        await expect(processProfilePicture(input)).rejects.toBeInstanceOf(
            ProfilePictureInvalidError
        );
    });

    it("refuses an animated WebP", async () => {
        // Two different frames, since the encoder merges equal ones.
        const first = await twoTone(64, 64).png().toBuffer();
        const second = await twoTone(64, 64).negate().png().toBuffer();
        const input = await sharp([first, second], {
            join: { animated: true },
        })
            .webp()
            .toBuffer();
        expect((await sharp(input).metadata()).pages).toBe(2);

        await expect(processProfilePicture(input)).rejects.toBeInstanceOf(
            ProfilePictureInvalidError
        );
    });

    it("refuses text that only looks like a PNG by its name", async () => {
        const input = Buffer.from("this is not an image, just a text file");

        await expect(processProfilePicture(input)).rejects.toBeInstanceOf(
            ProfilePictureInvalidError
        );
    });

    it("refuses a corrupted image", async () => {
        const valid = await twoTone(64, 64).png().toBuffer();
        const input = valid.subarray(0, Math.floor(valid.length / 2));

        await expect(processProfilePicture(input)).rejects.toBeInstanceOf(
            ProfilePictureInvalidError
        );
    });

    it("refuses an image whose shorter side is under the minimum", async () => {
        const input = await twoTone(500, PROFILE_PICTURE.minSide - 1)
            .png()
            .toBuffer();

        await expect(processProfilePicture(input)).rejects.toBeInstanceOf(
            ProfilePictureInvalidError
        );
    });

    it("accepts an image whose shorter side is exactly the minimum", async () => {
        const input = await twoTone(PROFILE_PICTURE.minSide, 100)
            .png()
            .toBuffer();

        await expectOutput(await processProfilePicture(input));
    });

    it("refuses a file over the byte limit", async () => {
        const input = Buffer.alloc(PROFILE_PICTURE.maxBytes + 1);

        await expect(processProfilePicture(input)).rejects.toBeInstanceOf(
            ProfilePictureTooLargeError
        );
    });

    it("refuses an image bomb before decoding it", async () => {
        // 8000 x 8000 is 64 million pixels, over the 40 million guard, and a
        // flat color keeps the file tiny.
        const input = await sharp({
            create: {
                width: 8000,
                height: 8000,
                channels: 3,
                background: { r: 10, g: 10, b: 10 },
            },
        })
            .png({ compressionLevel: 9 })
            .toBuffer();
        expect(input.length).toBeLessThan(PROFILE_PICTURE.maxBytes);

        await expect(processProfilePicture(input)).rejects.toBeInstanceOf(
            ProfilePictureInvalidError
        );
    });
});
