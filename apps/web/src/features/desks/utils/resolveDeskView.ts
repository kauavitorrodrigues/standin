import type { DeskStatus } from "../types/desk";
import type { DeskView } from "../types/deskCard";

type Params = {
    status: DeskStatus;
    ownUserId: string;
    // Whether the person already holds a desk of the space, so claiming a
    // free one moves them.
    hasOwnDesk: boolean;
};

export const resolveDeskView = ({
    status,
    ownUserId,
    hasOwnDesk,
}: Params): DeskView => {
    switch (status.kind) {
        case "free":
            return { kind: "free", action: hasOwnDesk ? "move" : "claim" };
        case "mine":
            return { kind: "owned", ownerId: ownUserId, isSelf: true };
        case "taken":
            return { kind: "owned", ownerId: status.ownerId, isSelf: false };
    }
};
