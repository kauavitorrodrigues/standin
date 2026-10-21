import type { PlayerDirection } from "../enums/player";
import type { User } from "../../users/types/user";

export type PlayerPosition = {
    x: number;
    y: number;
    direction: PlayerDirection;
    isSitting: boolean;
};

export type RemotePlayer = {
    socketId: string;
    userId: User["id"];
    // Null means the person has no avatar and is drawn as the ghost.
    avatarSheetFileId: string | null;
    // The name on the tag over the avatar. Empty when it could not be read, and
    // the tag stays hidden until a name arrives.
    name: string;
    // The photo of the profile, shown on the tag when it is clicked. Null means
    // the person has none, and the tag shows the initial.
    avatarUrl: string | null;
};
