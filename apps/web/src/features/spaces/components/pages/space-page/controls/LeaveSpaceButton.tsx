import { LogOutIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ControlButton } from "@/components/ControlButton";

export const LeaveSpaceButton = () => {
    return (
        <ControlButton
            render={<Link to="/home" aria-label="Sair do espaço" />}
            icon={LogOutIcon}
        />
    );
};
