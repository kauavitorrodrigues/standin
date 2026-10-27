import { USER_STATUSES, type UserStatus } from "../../consts/user-status";

type Props = { status: UserStatus };

/** The status of the person written under their name. */
export const UserStatusLabel = ({ status }: Props) => {
    if (status === USER_STATUSES.BUSY) {
        return <p className="text-xs text-muted-foreground">Ocupado</p>;
    }

    return <p className="text-xs text-muted-foreground">Ativo</p>;
};
