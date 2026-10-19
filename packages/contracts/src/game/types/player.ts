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
};
