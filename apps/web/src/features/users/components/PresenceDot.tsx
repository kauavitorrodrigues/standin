import { useUserStatus } from "../hooks/useUserStatus";
import { StatusDot } from "./views/StatusDot";

/**
 * The status dot on the avatar of the person: green when they are available,
 * grey when they are away and amber when they asked not to be disturbed.
 */
export const PresenceDot = () => {
    const { status } = useUserStatus();

    return (
        <StatusDot
            availability={status}
            className="absolute -right-0.5 -bottom-0.5 size-3 border-2 border-muted"
        />
    );
};
