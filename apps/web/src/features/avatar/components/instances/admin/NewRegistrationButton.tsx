import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AVATAR_ADMIN_PATHS } from "../../../consts/avatarNew";

// The one way into every registration of the avatar admin: it opens the page
// that asks what to create.
export const NewRegistrationButton = () => (
    <Button size="lg" render={<Link to={AVATAR_ADMIN_PATHS.NEW} />}>
        <PlusIcon />
        Novo cadastro
    </Button>
);
