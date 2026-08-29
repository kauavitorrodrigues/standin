import { useState } from "react";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
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
import { OrganizationsQueries } from "../../queries";
import { useOrganization } from "../../hooks/useOrganization";
import { CreateOrganizationDialog } from "../dialogs/CreateDialog";

export const OrganizationSwitcher = () => {
    const { organizations } = OrganizationsQueries.useAll();
    const { organization, setOrganization } = useOrganization();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    if (organizations.length === 0) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button variant="outline" className="min-w-40 justify-between">
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
                    <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon />
                        Criar organização
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateOrganizationDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </>
    );
};
