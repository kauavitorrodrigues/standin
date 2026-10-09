import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { UserAvatar } from "./UserAvatar";
import { UserAvatarInfo } from "./UserAvatarInfo";

export function UserWidget() {
    const { user } = useAuth();
    const logout = useLogout();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        className="relative size-9 rounded-xl p-0"
                        aria-label="Menu do usuário"
                    >
                        <UserAvatar
                            id={user.id}
                            name={user.name}
                            className="size-9 rounded-xl after:rounded-xl"
                            fallbackClassName="rounded-xl text-sm"
                        />
                        <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-muted bg-emerald-500" />
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="py-1.5">
                        <UserAvatarInfo
                            id={user.id}
                            name={user.name}
                            size="default"
                            nameClassName="max-w-40"
                        />
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between gap-2 px-1.5 py-1">
                    <span className="max-w-32 truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                    <Button variant="ghost" size="sm" onClick={logout}>
                        Sair
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
