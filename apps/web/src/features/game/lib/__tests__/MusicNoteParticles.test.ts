import { describe, expect, it, vi } from "vitest";
import { MUSIC_NOTE } from "@/features/game/consts/musicNotes";
import { MusicNoteParticles } from "../MusicNoteParticles";

const buildImage = () => {
    const image = {
        setDepth: vi.fn(() => image),
        setTexture: vi.fn(() => image),
        setActive: vi.fn(() => image),
        setVisible: vi.fn(() => image),
        setPosition: vi.fn(() => image),
        setRotation: vi.fn(() => image),
        setAlpha: vi.fn(() => image),
        destroy: vi.fn(),
    };
    return image;
};

const buildScene = (contains: () => boolean = () => true) => {
    const images: ReturnType<typeof buildImage>[] = [];
    const textures = new Set<string>();
    const graphics = {
        fillStyle: vi.fn(),
        fillEllipse: vi.fn(),
        fillRect: vi.fn(),
        fillTriangle: vi.fn(),
        generateTexture: vi.fn((key: string) => textures.add(key)),
        destroy: vi.fn(),
    };
    const scene = {
        scene: { isActive: () => true },
        cameras: { main: { worldView: { contains } } },
        make: { graphics: () => graphics },
        textures: {
            exists: (key: string) => textures.has(key),
            remove: (key: string) => textures.delete(key),
        },
        add: {
            image: () => {
                const image = buildImage();
                images.push(image);
                return image;
            },
        },
    };
    return { scene, images, textures };
};

const source = { key: "u1", feet: { x: 50, y: 50 } };
// A random that makes every wait the shortest one.
const never = () => 0;
const FRAME = 16;
const OVER_INTERVAL = MUSIC_NOTE.SPAWN_INTERVAL_MAX_MS + FRAME;

describe("MusicNoteParticles", () => {
    it("throws a note once the wait of a playing avatar is over", () => {
        const { scene, images } = buildScene();
        const notes = new MusicNoteParticles(scene as never, never);

        notes.update(FRAME, [source], false);
        expect(images).toHaveLength(0);

        notes.update(OVER_INTERVAL, [source], false);
        expect(images).toHaveLength(1);
    });

    it("throws the first note soon and the next ones at the regular rhythm", () => {
        const { scene, images } = buildScene();
        const notes = new MusicNoteParticles(scene as never, never);
        const SOON = MUSIC_NOTE.FIRST_NOTE_DELAY_MAX_MS + FRAME;
        // The pool reuses images, so a thrown note is counted when it wakes.
        const thrown = () =>
            images
                .flatMap((image) => image.setActive.mock.calls)
                .filter((call: unknown[]) => call[0] === true).length;

        notes.update(SOON, [source], false);
        expect(thrown()).toBe(1);

        notes.update(MUSIC_NOTE.SPAWN_INTERVAL_MIN_MS / 2, [source], false);
        expect(thrown()).toBe(1);

        notes.update(MUSIC_NOTE.SPAWN_INTERVAL_MAX_MS, [source], false);
        expect(thrown()).toBe(2);
    });

    it("throws nothing for an avatar that is not in the list", () => {
        const { scene, images } = buildScene();
        const notes = new MusicNoteParticles(scene as never, never);

        notes.update(OVER_INTERVAL, [], false);

        expect(images).toHaveLength(0);
    });

    it("throws nothing outside the camera", () => {
        const { scene, images } = buildScene(() => false);
        const notes = new MusicNoteParticles(scene as never, never);

        notes.update(OVER_INTERVAL, [source], false);

        expect(images).toHaveLength(0);
    });

    it("draws nothing and clears the notes in the air with reduced motion", () => {
        const { scene, images } = buildScene();
        const notes = new MusicNoteParticles(scene as never, never);
        notes.update(OVER_INTERVAL, [source], false);

        notes.update(OVER_INTERVAL, [source], true);
        notes.update(OVER_INTERVAL, [source], true);

        expect(images).toHaveLength(1);
        expect(images[0].setVisible).toHaveBeenLastCalledWith(false);
    });

    it("never holds more than MAX_ACTIVE notes", () => {
        const { scene, images } = buildScene();
        const notes = new MusicNoteParticles(scene as never, never);
        const crowd = Array.from({ length: 200 }, (_, index) => ({
            key: `u${index}`,
            feet: { x: 50, y: 50 },
        }));

        notes.update(OVER_INTERVAL, crowd, false);

        expect(images.length).toBeLessThanOrEqual(MUSIC_NOTE.MAX_ACTIVE);
    });

    it("gives the notes back to the pool once their life is over", () => {
        const { scene, images } = buildScene();
        const notes = new MusicNoteParticles(scene as never, never);
        notes.update(OVER_INTERVAL, [source], false);

        notes.update(MUSIC_NOTE.LIFE_MAX_MS + FRAME, [], false);

        expect(images[0].setVisible).toHaveBeenLastCalledWith(false);
    });
});
