import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

export const CreateButton = () => {
    const { paths } = useLibraryScope();

    return (
        <Button size="lg" render={<Link to={paths.newAsset} />}>
            <PlusIcon />
            Novo asset
        </Button>
    );
};
