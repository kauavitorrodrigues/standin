import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

export const NewAreaButton = () => {
    const { paths } = useLibraryScope();

    return (
        <Button size="lg" render={<Link to={paths.newArea} />}>
            <PlusIcon />
            Nova área
        </Button>
    );
};
