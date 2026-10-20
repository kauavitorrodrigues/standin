import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AVATAR_ADMIN_PATHS } from "../../../consts/avatarNew";

export const BackToPartsButton = () => (
    <Button variant="outline" render={<Link to={AVATAR_ADMIN_PATHS.PARTS} />}>
        <ArrowLeftIcon />
        Voltar
    </Button>
);
