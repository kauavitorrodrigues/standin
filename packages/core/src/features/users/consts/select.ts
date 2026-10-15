import { usersTable } from "@standin/database";

export const userSelect = {
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
};

export const userSummarySelect = {
    id: usersTable.id,
    name: usersTable.name,
    avatarUrl: usersTable.avatar,
};
