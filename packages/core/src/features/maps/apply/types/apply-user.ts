import type { User } from "@standin/contracts";

// Who applies: the lock shows the name to whoever is refused.
export type ApplyUser = Pick<User, "id" | "name">;
