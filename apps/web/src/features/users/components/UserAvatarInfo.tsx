import { cn } from "@/lib/utils";
import { memo } from "react";
import { UserAvatar, type UserAvatarSize } from "./UserAvatar";

type Props = {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
    hideInfo?: boolean;
    size?: UserAvatarSize;
    children?: React.ReactNode;
    nameClassName?: string;
    emailClassName?: string;
    className?: string;
    avatarClassname?: string;
    fallbackClassName?: string;
};

export const UserAvatarInfo = ({
    id,
    name,
    hideInfo = false,
    email,
    avatar,
    size = "md",
    children,
    className,
    nameClassName,
    fallbackClassName,
    emailClassName,
    avatarClassname,
}: Props) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <UserAvatar
                id={id}
                avatar={avatar}
                size={size}
                className={avatarClassname}
                fallbackClassName={fallbackClassName}
            />
            {!hideInfo &&
                (children ?? (
                    <div className="flex flex-col">
                        <span
                            className={cn(
                                "text-sm font-medium max-w-24 truncate",
                                nameClassName
                            )}
                        >
                            {name}
                        </span>
                        {email && (
                            <span
                                className={cn(
                                    "text-xs text-muted-foreground max-w-24 truncate",
                                    emailClassName
                                )}
                            >
                                {email}
                            </span>
                        )}
                    </div>
                ))}
        </div>
    );
};

export const MemoizedUserAvatarInfo = memo(UserAvatarInfo);
