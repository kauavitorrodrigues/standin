import { HeadphonesIcon, UserRoundPenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { USER_STATUSES } from "../../consts/user-status";
import { useUserStatus } from "../../hooks/useUserStatus";
import { EditProfileDialog } from "../dialogs/EditProfileDialog";
import { StatusMessageField } from "../fields/StatusMessageField";
import { UserStatusOption } from "./UserStatusOption";
import { UserStatusLabel } from "./UserStatusLabel";

/**
 * The card that opens over the control bar when the person clicks their own
 * avatar: their name and status, the way to edit their profile, the choice
 * between active and busy and the line for what they are up to.
 */
export const UserStatusPanel = () => {
    const { user } = useAuth();
    const { status, setStatus } = useUserStatus();

    return (
        <div className="flex flex-col gap-2 p-2">
            <div className="flex items-start justify-between gap-2 px-1">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <UserStatusLabel status={status} />
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
                        <span className="size-2.5 rounded-full bg-emerald-500" />
                    }
                >
                    Ativo
                </UserStatusOption>
                <UserStatusOption
                    isSelected={status === USER_STATUSES.BUSY}
                    onSelect={() => setStatus(USER_STATUSES.BUSY)}
                    icon={<HeadphonesIcon className="text-amber-500" />}
                >
                    Ocupado
                </UserStatusOption>
            </div>
            <StatusMessageField />
        </div>
    );
};
