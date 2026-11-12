import { HeadphonesIcon, UserRoundPenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { USER_STATUS_LABELS, USER_STATUSES } from "../../consts/user-status";
import { useUserStatus } from "../../hooks/useUserStatus";
import { EditProfileDialog } from "../dialogs/EditProfileDialog";
import { CustomStatusField } from "../fields/CustomStatusField";
import { CustomStatusLine } from "./CustomStatusLine";
import { StatusDot } from "./StatusDot";
import { UserStatusOption } from "./UserStatusOption";
import { UserStatusLabel } from "./UserStatusLabel";

/**
 * The card that opens over the control bar when the person clicks their own
 * avatar: their name and status, the way to edit their profile, the choice
 * between active, away and busy and the line for what they are up to.
 */
export const UserStatusPanel = () => {
    const { user } = useAuth();
    const { status, setStatus, customStatus } = useUserStatus();

    return (
        <div className="flex flex-col gap-2 px-1.5 py-2">
            <div className="flex items-start justify-between gap-2 px-1">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <UserStatusLabel status={status} />
                    <CustomStatusLine customStatus={customStatus} />
                </div>
                <EditProfileDialog>
                    <DialogTrigger
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Editar perfil"
                            />
                        }
                    >
                        <UserRoundPenIcon />
                    </DialogTrigger>
                </EditProfileDialog>
            </div>
            <div className="flex gap-2">
                <UserStatusOption
                    isSelected={status === USER_STATUSES.ACTIVE}
                    onSelect={() => setStatus(USER_STATUSES.ACTIVE)}
                    icon={
                        <StatusDot
                            availability={USER_STATUSES.ACTIVE}
                            className="size-2.5"
                        />
                    }
                >
                    {USER_STATUS_LABELS[USER_STATUSES.ACTIVE]}
                </UserStatusOption>
                <UserStatusOption
                    isSelected={status === USER_STATUSES.BUSY}
                    onSelect={() => setStatus(USER_STATUSES.BUSY)}
                    icon={<HeadphonesIcon className="text-amber-500" />}
                >
                    {USER_STATUS_LABELS[USER_STATUSES.BUSY]}
                </UserStatusOption>
                <UserStatusOption
                    isSelected={status === USER_STATUSES.AWAY}
                    onSelect={() => setStatus(USER_STATUSES.AWAY)}
                    icon={
                        <StatusDot
                            availability={USER_STATUSES.AWAY}
                            className="size-2.5"
                        />
                    }
                >
                    {USER_STATUS_LABELS[USER_STATUSES.AWAY]}
                </UserStatusOption>
            </div>
            <CustomStatusField />
        </div>
    );
};
