import { useState } from "react";
import { ChevronsUpDownIcon, PlusIcon, UserPlusIcon } from "lucide-react";
import { USER_ROLES } from "@standin/contracts";
import { Button } from "@/components/ui/button";
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
import { useGlobalCapabilities } from "@/features/global-settings/queries/useGlobalCapabilities";
import { InviteLinksDialog } from "../../invite-links/components/InviteLinksDialog";
import { OrganizationsQueries } from "../../queries";
import { useOrganization } from "../../hooks/useOrganization";
import { CreateOrganizationDialog } from "../dialogs/CreateDialog";

export const OrganizationSwitcher = () => {
    const { organizations } = OrganizationsQueries.useAll();
    const { organization, setOrganization } = useOrganization();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const { user } = useAuth();
    const { canCreateOrganization } = useGlobalCapabilities();
    const canInvite =
        !!organization &&
        (organization.ownerId === user.id || user.role === USER_ROLES.ADMIN);

    if (organizations.length === 0) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="outline"
                            className="min-w-40 justify-between"
                        >
                            <span className="truncate">
                                {organization?.name ?? "Selecionar organização"}
                            </span>
                            <ChevronsUpDownIcon className="opacity-50" />
                        </Button>
                    }
                />
                <DropdownMenuContent align="end" className="min-w-56">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Organizações</DropdownMenuLabel>
                        {organizations.map((org) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => setOrganization(org)}
                                data-selected={org.id === organization?.id}
                                className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                            >
                                <span className="truncate">{org.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    {canInvite && (
                        <DropdownMenuItem
                            onClick={() => setIsInviteDialogOpen(true)}
                        >
                            <UserPlusIcon />
                            Convidar pessoas
                        </DropdownMenuItem>
                    )}
                    {canCreateOrganization && (
                        <DropdownMenuItem
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <PlusIcon />
                            Criar organização
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {organization && (
                <InviteLinksDialog
                    organizationId={organization.id}
                    open={isInviteDialogOpen}
                    onOpenChange={setIsInviteDialogOpen}
                />
            )}

            <CreateOrganizationDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </>
    );
};
