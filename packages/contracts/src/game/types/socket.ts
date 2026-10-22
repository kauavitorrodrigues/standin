import type { User } from "../../users/types/user";
import type { Space } from "../../spaces/types/space";

export type SocketData = {
    userId: User["id"];
    spaceId: Space["id"] | null;
    // Joined the space as a guest of it, not as a member of its organization.
    isGuest?: boolean;
};
