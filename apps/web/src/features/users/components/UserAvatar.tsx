import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitial } from "../utils/getInitial";
import { getAvatarHue } from "../utils/getAvatarHue";

export type UserAvatarSize = "xs" | "sm" | "default" | "md" | "lg" | "xl";

const AVATAR_SIZE_CLASSES: Record<UserAvatarSize, string> = {
    xs: "size-5",
    sm: "size-7",
    default: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
};

const INITIAL_TEXT_CLASSES: Record<UserAvatarSize, string> = {
    xs: "text-[0.6rem]",
    sm: "text-xs",
    default: "text-sm",
    md: "text-sm",
    lg: "text-2xl",
    xl: "text-4xl",
};

type Props = {
    id: string;
    name: string;
    avatar?: string | null;
    size?: UserAvatarSize;
    className?: string;
    fallbackClassName?: string;
};

// Without a picture the avatar is the person's first initial on a flat color
// derived from their id: plain DOM, nothing to render or animate.
export const UserAvatar = ({
    id,
    name,
    avatar,
    size = "md",
    className,
    fallbackClassName,
}: Props) => (
    <Avatar className={cn(AVATAR_SIZE_CLASSES[size], className)}>
        <AvatarImage src={avatar ?? undefined} alt="" />
        <AvatarFallback
            className={cn(
                "font-medium text-white",
                INITIAL_TEXT_CLASSES[size],
                fallbackClassName
            )}
            style={{ backgroundColor: `hsl(${getAvatarHue(id)} 45% 40%)` }}
        >
            {getInitial(name)}
        </AvatarFallback>
    </Avatar>
);
