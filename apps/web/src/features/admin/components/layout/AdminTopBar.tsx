import { SidebarTrigger } from "@/components/ui/sidebar";

// Mobile has no sidebar on screen, so this bar is the only way to open it.
export const AdminTopBar = () => {
    return (
        <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2 md:hidden">
            <SidebarTrigger />
            <span className="text-sm font-medium">Administração</span>
        </div>
    );
};
