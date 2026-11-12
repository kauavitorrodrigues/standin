import { ClockIcon, XIcon } from "lucide-react";
import type { Availability, CustomStatus } from "@standin/contracts";
import { UserAvatar } from "../UserAvatar";
import { CustomStatusLine } from "./CustomStatusLine";
import { OnlineDot } from "./OnlineDot";
import { UserStatusLabel } from "./UserStatusLabel";
import { Button } from "@/components/ui/button";

type ProfileHeaderProps = {
    id: string;
    name: string;
    avatar?: string | null;
    isOnline: boolean;
    // Away, busy or active, and what the person is up to. Left out they show
    // as active with nothing to say.
    availability?: Availability;
    customStatus?: CustomStatus | null;
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
    availability,
    customStatus = null,
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
            <OnlineDot
                isOnline={isOnline}
                availability={availability}
                className="size-3 ring-popover"
            />
        </div>
        <div className="min-w-0">
            <p className="truncate text-base leading-5 font-semibold text-popover-foreground">
                {name}
            </p>
            {availability && <UserStatusLabel status={availability} />}
            <LocalTime value={localTime} />
            <CustomStatusLine customStatus={customStatus} />
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
