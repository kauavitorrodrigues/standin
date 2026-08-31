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
import { UserAvatarInfo } from "./UserAvatarInfo";

export function UserWidget() {
    const { user } = useAuth();
    const logout = useLogout();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="outline" className="p-3 rounded-xl h-10">
                        <UserAvatarInfo
                            id={user.id}
                            name={user.name}
                            size="xs"
                            nameClassName="text-white"
                        />
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