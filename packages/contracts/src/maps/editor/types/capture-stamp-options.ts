export type CaptureStampOptions = {
    // Name of the area zone the stamp creates when placed. Null for no zone.
    zoneLabel: string | null;
    // The layer the ground of the stamp is read from. The composer keeps it on
    // the ground layer (the default), a map on the floor layer of its areas.
    groundLayer?: string;
};
