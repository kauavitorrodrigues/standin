import { LogOutIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const LeaveSpaceButton = () => {
    return (
        <Button variant="outline" size="icon-lg" render={<Link to="/home" />}>
            <LogOutIcon />
        </Button>
    );
};
