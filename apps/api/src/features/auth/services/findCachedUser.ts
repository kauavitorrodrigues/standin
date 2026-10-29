import { UserService } from "@standin/core";
import { UserCache } from "./userCache";

export const findCachedUser = async (userId: string) => {
    const cached = UserCache.get(userId);
    if (cached) return cached;

    const user = await UserService.findById(userId);
    if (!user) return false;

    UserCache.set(user);
    return user;
};
