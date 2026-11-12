import { USER_STATUS_LABELS, type UserStatus } from "../../consts/user-status";

type Props = { status: UserStatus };

/** The status of the person written under their name. */
export const UserStatusLabel = ({ status }: Props) => (
    <p className="text-xs text-muted-foreground">
        {USER_STATUS_LABELS[status]}
    </p>
);
