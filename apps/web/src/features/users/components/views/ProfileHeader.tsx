import { ClockIcon, XIcon } from "lucide-react";
import { UserAvatar } from "../UserAvatar";
import { OnlineDot } from "./OnlineDot";
import { Button } from "@/components/ui/button";

type ProfileHeaderProps = {
    id: string;
    name: string;
    avatar?: string | null;
    isOnline: boolean;
    // The local time of the person. Left out when it is not known, as for
    // somebody else, whose time zone the app does not have.
    localTime?: string;
    onClose: () => void;
};

const LocalTime = ({ value }: { value?: string }) => {
    if (value === undefined) return null;

    return (
        <p className="flex items-center gap-1 text-sm leading-4 text-muted-foreground">
            <ClockIcon className="size-3.5 shrink-0" />
            {value}
        </p>
    );
};

export const ProfileHeader = ({
    id,
    name,
    avatar,
    isOnline,
    localTime,
    onClose,
}: ProfileHeaderProps) => (
    <div className="flex items-center gap-4">
        <div className="relative shrink-0">
            <UserAvatar
                id={id}
                name={name}
                avatar={avatar}
                size="lg"
                className="size-12"
            />
            <OnlineDot isOnline={isOnline} className="size-3 ring-popover" />
        </div>
        <div className="min-w-0">
            <p className="truncate text-base leading-5 font-semibold text-popover-foreground">
                {name}
            </p>
            <LocalTime value={localTime} />
        </div>
        <Button
            type="button"
            icon={XIcon}
            size="icon"
            variant="ghost"
            aria-label="Fechar"
            onClick={onClose}
            className="absolute top-2 right-2 text-muted-foreground"
        />
    </div>
);
