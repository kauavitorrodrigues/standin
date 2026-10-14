import { BoxIcon, Grid2x2Icon, LayoutGridIcon } from "lucide-react";
import { SectionSidebar } from "./SectionSidebar";
import { SectionSidebarLink } from "./SectionSidebarLink";

// Below the page header, so it is contained instead of pinned to the
// viewport. The user menu is already on that header.
export const LibrarySidebar = () => (
    <SectionSidebar position="contained">
        <SectionSidebarLink
            to="/library/assets"
            icon={BoxIcon}
            label="Biblioteca de recursos"
        />
        <SectionSidebarLink
            to="/library/tilesets"
            icon={Grid2x2Icon}
            label="Tilesets"
        />
        <SectionSidebarLink
            to="/library/areas"
            icon={LayoutGridIcon}
            label="Áreas"
        />
    </SectionSidebar>
);
