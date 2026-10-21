// A person was renamed. Sent only when the name really changed.
export type UserNameChange = {
    userId: string;
    name: string;
};

export type UserNameListener = (change: UserNameChange) => void | Promise<void>;
