import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CreateTilesetButton = () => (
    <Button render={<Link to="/admin/tilesets/new" />}>
        <PlusIcon />
        Novo tileset
    </Button>
);
