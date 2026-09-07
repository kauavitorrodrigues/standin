import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FallbackAvatar from "@/components/ui/fallback-avatar";
import { cn } from "@/lib/utils";

export type UserAvatarSize = "xs" | "sm" | "default" | "md" | "lg" | "xl";

const AVATAR_SIZE_CLASSES: Record<UserAvatarSize, string> = {
    xs: "size-5",
    sm: "size-7",
    default: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
};

const AVATAR_PIXEL_SIZES: Record<UserAvatarSize, number> = {
    xs: 20,
    sm: 28,
    default: 32,
    md: 36,
    lg: 64,
    xl: 96,
};

type Props = {
    id: string;
    avatar?: string | null;
    size?: UserAvatarSize;
    className?: string;
    fallbackClassName?: string;
};

export const UserAvatar = ({
    id,
    avatar,
    size = "md",
    className,
    fallbackClassName,
}: Props) => (
    <Avatar className={cn(AVATAR_SIZE_CLASSES[size], className)}>
        <AvatarImage src={avatar ?? undefined} alt="" />
        <AvatarFallback className={cn("bg-transparent", fallbackClassName)}>
            <FallbackAvatar
                name={id}
                size={AVATAR_PIXEL_SIZES[size]}
                className="size-full"
            />
        </AvatarFallback>
    </Avatar>
);
