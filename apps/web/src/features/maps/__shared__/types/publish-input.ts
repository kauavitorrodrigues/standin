import type {
    MapPublishRequest,
    ObjectsPublishRequest,
} from "@standin/contracts";

// The request of the Studio (the whole map) or of the decorator (only the
// objects), with the map and the session of the lock it goes with.
export type PublishInput = (MapPublishRequest | ObjectsPublishRequest) & {
    mapId: string;
    sessionId: string;
};
