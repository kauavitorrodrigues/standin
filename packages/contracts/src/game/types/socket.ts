import type { User } from "../../users/types/user";
import type { Space } from "../../spaces/types/space";

export type SocketData = {
    userId: User["id"];
    spaceId: Space["id"] | null;
};
