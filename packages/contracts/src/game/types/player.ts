import type { PlayerDirection } from "../enums/player";
import type { User } from "../../users/types/user";

// Placeholder until avatar customization (body/hair/clothing) exists as a
// real feature, resolved server-side from the user record.
export type AvatarConfig = Record<string, unknown> | null;

export type PlayerPosition = {
    x: number;
    y: number;
    direction: PlayerDirection;
    isSitting: boolean;
};

export type RemotePlayer = {
    socketId: string;
    userId: User["id"];
    avatarConfig: AvatarConfig;
};
