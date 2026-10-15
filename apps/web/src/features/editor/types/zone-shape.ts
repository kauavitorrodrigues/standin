export type ZoneOutline = { x: number; y: number }[];

export type ZoneSpawnShape = { kind: "spawn"; x: number; y: number };

export type ZoneAreaShape = {
    kind: "area";
    outline: ZoneOutline;
    labelX: number;
    labelY: number;
    label: string;
};

// A room (a private zone) is drawn as an outline like an area, in its own color.
export type ZoneRoomShape = Omit<ZoneAreaShape, "kind"> & { kind: "room" };

export type ZoneShape = ZoneSpawnShape | ZoneAreaShape | ZoneRoomShape;
