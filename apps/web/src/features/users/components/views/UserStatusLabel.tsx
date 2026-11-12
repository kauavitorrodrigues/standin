import type { UserStatus } from "../../consts/user-status";
import { USER_STATUS_MESSAGES } from "../../consts/messages";

type Props = { status: UserStatus };

/** The status of the person written under their name. */
export const UserStatusLabel = ({ status }: Props) => (
    <p className="text-xs text-muted-foreground">
        {USER_STATUS_MESSAGES.LABELS[status]}
    </p>
);
