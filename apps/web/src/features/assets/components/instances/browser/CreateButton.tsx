import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CreateButton = () => (
    <Button render={<Link to="/admin/assets/new" />}>
        <PlusIcon />
        Novo asset
    </Button>
);
