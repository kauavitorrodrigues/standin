import { LogOutIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { UserAvatarInfo } from "./UserAvatarInfo";

type Props = {
    side?: "bottom" | "right";
    align?: "start" | "end";
    // Only the avatar on the trigger, for narrow spots like a rail.
    compact?: boolean;
};

export function UserMenu({
    side = "bottom",
    align = "end",
    compact = false,
}: Props) {
    const { user } = useAuth();
    const logout = useLogout();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <button
                        type="button"
                        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <UserAvatarInfo
                            id={user.id}
                            name={user.name}
                            avatar={user.profilePictureUrl}
                            size="sm"
                            hideInfo={compact}
                        />
                    </button>
                }
            />
            <DropdownMenuContent side={side} align={align} className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="py-1.5">
                        <UserAvatarInfo
                            id={user.id}
                            name={user.name}
                            avatar={user.profilePictureUrl}
                            email={user.email}
                            size="default"
                            nameClassName="max-w-40"
                            emailClassName="max-w-40"
                        />
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive" onClick={logout}>
                        <LogOutIcon />
                        Sair
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
