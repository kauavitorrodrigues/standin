type Signable = {
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    alpha?: number;
    visible?: boolean;
    depth?: number;
    tintTopLeft?: number;
    displayWidth?: number;
    displayHeight?: number;
    frame?: { name?: string | number; texture?: { key?: string } };
    text?: string;
    commandBuffer?: unknown[];
    list?: Signable[];
};

export type SignableScene = {
    children: { list: Signable[] };
    cameras: {
        cameras: {
            scrollX: number;
            scrollY: number;
            zoom: number;
            width: number;
            height: number;
            alpha: number;
        }[];
    };
};

const mix = (hash: number, value: number): number =>
    Math.imul(hash ^ (Math.round(value * 1024) | 0), 16777619) >>> 0;

const mixString = (hash: number, value: string): number => {
    let next = hash;
    for (let i = 0; i < value.length; i++) {
        next = Math.imul(next ^ value.charCodeAt(i), 16777619) >>> 0;
    }
    return next;
};

const mixObject = (start: number, object: Signable): number => {
    let hash = start;
    hash = mix(hash, object.x ?? 0);
    hash = mix(hash, object.y ?? 0);
    hash = mix(hash, object.scaleX ?? 1);
    hash = mix(hash, object.scaleY ?? 1);
    hash = mix(hash, object.rotation ?? 0);
    hash = mix(hash, object.alpha ?? 1);
    hash = mix(hash, object.visible === false ? 0 : 1);
    hash = mix(hash, object.depth ?? 0);
    hash = mix(hash, object.tintTopLeft ?? 0);
    hash = mix(hash, object.displayWidth ?? 0);
    hash = mix(hash, object.displayHeight ?? 0);
    if (object.frame) {
        hash = mixString(hash, String(object.frame.name ?? ""));
        hash = mixString(hash, object.frame.texture?.key ?? "");
    }
    if (typeof object.text === "string") hash = mixString(hash, object.text);
    if (object.commandBuffer) hash = mix(hash, object.commandBuffer.length);
    if (object.list) {
        for (const child of object.list) hash = mixObject(hash, child);
    }
    return hash;
};

// A number that changes whenever something the canvas draws changed: the
// cameras and every display object (position, scale, alpha, frame, text,
// graphics commands, children of containers). Blinks, emotes, particles,
// remote avatars and typing marks all move one of these, so none of them
// needs to raise the dirty flag by hand.
export const computeSceneSignature = (scene: SignableScene): number => {
    let hash = 2166136261;
    for (const camera of scene.cameras.cameras) {
        hash = mix(hash, camera.scrollX);
        hash = mix(hash, camera.scrollY);
        hash = mix(hash, camera.zoom);
        hash = mix(hash, camera.width);
        hash = mix(hash, camera.height);
        hash = mix(hash, camera.alpha);
    }
    for (const object of scene.children.list) hash = mixObject(hash, object);
    return hash;
};
