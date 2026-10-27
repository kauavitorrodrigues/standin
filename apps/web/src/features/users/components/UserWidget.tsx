import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserAvatar } from "./UserAvatar";
import { PresenceDot } from "./PresenceDot";

type Props = {
    // Whether the status card over the control bar is open.
    isOpen: boolean;
    onToggle: () => void;
};

/**
 * The avatar of the person in the control bar. Clicking it opens and closes
 * the status card that grows out of the bar.
 */
export function UserWidget({ isOpen, onToggle }: Props) {
    const { user } = useAuth();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="relative size-9 rounded-xl p-0"
            aria-label="Meu status"
            aria-expanded={isOpen}
            onClick={onToggle}
        >
            <UserAvatar
                id={user.id}
                name={user.name}
                avatar={user.profilePictureUrl}
                className="size-9 rounded-xl after:rounded-xl"
                fallbackClassName="rounded-xl text-sm"
            />
            <PresenceDot />
        </Button>
    );
}
