import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FallbackAvatar from "@/components/ui/fallback-avatar";
import { cn } from "@/lib/utils";
import { memo } from "react";

type Props = {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
    hideInfo?: boolean;
    size?: "xs" | "sm" | "default" | "md" | "lg" | "xl";
    children?: React.ReactNode;
    nameClassName?: string;
    emailClassName?: string;
    className?: string;
    avatarClassname?: string;
    fallbackClassName?: string;
};

const avatarSizes = {
    xs: "size-5",
    sm: "size-7",
    default: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
};

const avatarPixelSizes: Record<keyof typeof avatarSizes, number> = {
    xs: 20,
    sm: 28,
    default: 32,
    md: 36,
    lg: 64,
    xl: 96,
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
            <Avatar className={cn(avatarSizes[size], avatarClassname)}>
                <AvatarImage src={avatar ?? undefined} alt="" />
                <AvatarFallback className={cn("bg-transparent", fallbackClassName)}>
                    <FallbackAvatar
                        name={id}
                        size={avatarPixelSizes[size]}
                        className="size-full"
                    />
                </AvatarFallback>
            </Avatar>
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
