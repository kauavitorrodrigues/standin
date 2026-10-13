import { LAYOUT_ZONE_KINDS, type LayoutObject } from "../schemas/layout.schema";

export type ZoneKind =
    (typeof LAYOUT_ZONE_KINDS)[keyof typeof LAYOUT_ZONE_KINDS];

// A zone is a Tiled object with a `kind` property, in the `zones` group.
export type Zone = {
    // Assigned by the server when a new zone arrives without one.
    id?: number;
    kind: string;
    name?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    // Points relative to x and y. A polygon has width and height 0 in Tiled.
    polygon?: { x: number; y: number }[];
    label?: string;
    key?: string;
    targetX?: number;
    targetY?: number;
};

const ZONE_PROPERTY_NAMES = ["kind", "label", "key", "targetX", "targetY"];

const getProperty = (object: LayoutObject, name: string): unknown =>
    object.properties.find((property) => property.name === name)?.value;

export const isZoneObject = (object: LayoutObject): boolean =>
    getProperty(object, "kind") !== undefined;

export const objectToZone = (object: LayoutObject): Zone => {
    const label = getProperty(object, "label");
    const key = getProperty(object, "key");
    const targetX = getProperty(object, "targetX");
    const targetY = getProperty(object, "targetY");

    return {
        id: object.id,
        kind: String(getProperty(object, "kind")),
        name: object.name,
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        rotation: object.rotation,
        polygon: object.polygon,
        label: typeof label === "string" ? label : undefined,
        key: typeof key === "string" ? key : undefined,
        targetX: typeof targetX === "number" ? targetX : undefined,
        targetY: typeof targetY === "number" ? targetY : undefined,
    };
};

export const zoneToObject = (zone: Zone, id: number): LayoutObject => {
    const properties: LayoutObject["properties"] = [
        { name: "kind", type: "string", value: zone.kind },
    ];
    if (zone.label !== undefined) {
        properties.push({ name: "label", type: "string", value: zone.label });
    }
    if (zone.key !== undefined) {
        properties.push({ name: "key", type: "string", value: zone.key });
    }
    if (zone.targetX !== undefined) {
        properties.push({ name: "targetX", type: "int", value: zone.targetX });
    }
    if (zone.targetY !== undefined) {
        properties.push({ name: "targetY", type: "int", value: zone.targetY });
    }

    return {
        id,
        name: zone.name ?? zone.kind,
        type: "",
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        rotation: zone.rotation ?? 0,
        visible: true,
        ...(zone.polygon ? { polygon: zone.polygon } : {}),
        properties,
    };
};

export { ZONE_PROPERTY_NAMES };
