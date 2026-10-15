export type ZoneOutline = { x: number; y: number }[];

export type ZoneSpawnShape = { kind: "spawn"; x: number; y: number };

export type ZoneAreaShape = {
    kind: "area";
    outline: ZoneOutline;
    labelX: number;
    labelY: number;
    label: string;
};

export type ZoneShape = ZoneSpawnShape | ZoneAreaShape;
