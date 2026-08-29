import type { Space } from "@standin/contracts";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SpacesQueries } from "@/features/spaces/queries";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import {
    SpaceErrorState,
    SpaceLoadingState,
    SpaceNotFoundState,
} from "@/features/spaces/components/pages/space-page/ContentStates";
import { SpacePageRoot } from "@/features/spaces/components/pages/space-page/Root";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import {
    SpaceSidebar,
    useSpacePageSidebarState,
} from "@/features/spaces/components/pages/space-page/layout/sidebar";
import { LeaveSpaceButton } from "@/features/spaces/components/pages/space-page/layout/LeaveSpaceButton";
import {
    CameraToggleButton,
    MicToggleButton,
} from "@/features/media-devices/components";
import { Logo } from "@/components/layout/Logo";

type ContentProps = {
    isLoading: boolean;
    isError: boolean;
    space: Space | undefined;
};

function Content({ isLoading, isError, space }: ContentProps) {
    if (isLoading) return <SpaceLoadingState />;
    if (isError) return <SpaceErrorState />;
    if (!space) return <SpaceNotFoundState />;
    return (
        <div className="flex min-h-0 w-full flex-1 bg-muted items-center justify-center">
            <span>O mapa aparece aqui!</span>
        </div>
    );
}

export function SpacePage({ spaceId }: { spaceId: string }) {
    const { open, setOpen } = useSpacePageSidebarState();
    const organizationId = useOrganization().organization?.id ?? "";
    const { space, isLoading, isError } = SpacesQueries.useDetails(
        organizationId,
        spaceId
    );

    return (
        <SidebarProvider open={open} onOpenChange={setOpen}>
            <SpacePageRoot>
                <LayoutPrimitive.Header />
                <LayoutPrimitive.Body>
                    <LayoutPrimitive.Content>
                        <Content
                            isLoading={isLoading}
                            isError={isError}
                            space={space}
                        />
                    </LayoutPrimitive.Content>
                    <LayoutPrimitive.Sidebar />
                </LayoutPrimitive.Body>
                <LayoutPrimitive.Controls>
                    <Logo />
                    <LayoutPrimitive.ControlGroup>
                        <MicToggleButton />
                        <CameraToggleButton />
                    </LayoutPrimitive.ControlGroup>
                    <LayoutPrimitive.ControlGroup>
                        <SpaceSidebar.Trigger />
                        <LeaveSpaceButton />
                    </LayoutPrimitive.ControlGroup>
                </LayoutPrimitive.Controls>
            </SpacePageRoot>
        </SidebarProvider>
    );
}
