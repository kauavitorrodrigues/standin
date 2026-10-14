import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NewAreaButton = () => (
    <Button size="lg" render={<Link to="/admin/areas/new" />}>
        <PlusIcon />
        Nova área
    </Button>
);
