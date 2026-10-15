// The locked room whose door the local avatar is standing near.
export type LockedDoor = {
    roomKey: string;
    roomLabel: string;
};

export type LockedDoorPromptStatus = "asking" | "sent" | "declined";

export type LockedDoorPrompt = LockedDoor & {
    status: LockedDoorPromptStatus;
};
