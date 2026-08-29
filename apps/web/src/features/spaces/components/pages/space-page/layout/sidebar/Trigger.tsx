import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export const Trigger = () => {
    const { open, toggleSidebar } = useSidebar();
    const Icon = open ? PanelLeftCloseIcon : PanelLeftOpenIcon;

    return (
        <Button
            variant="outline"
            size="icon-lg"
            aria-label={open ? "Fechar painel lateral" : "Abrir painel lateral"}
            onClick={toggleSidebar}
        >
            <Icon />
        </Button>
    );
};
