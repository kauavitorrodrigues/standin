import type { Ref } from "react";
import type { SpaceDetails } from "@standin/contracts";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SpacesQueries } from "@/features/spaces/queries";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import { SocketProvider } from "@/features/game/multiplayer/contexts/SocketContext";
import { useSocket } from "@/features/game/multiplayer/hooks/useSocket";
import {
    SpaceDuplicateSessionState,
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
import { useGameEngine } from "@/features/game/hooks/useGameEngine";
import { GameCanvas } from "@/features/game/components/GameCanvas";
import { GameControls } from "@/features/game/components/GameControls";
import type { GameEngineHandle } from "@/features/game/types/game";
import { UserWidget } from "@/features/users/components/UserWidget";
import { Separator } from "@/components/ui/separator";
import { SIDEBAR_WIDTH_PX } from "@/features/spaces/components/pages/space-page/layout/sidebarWidth";

type ContentProps = {
    isDuplicateSession: boolean;
    isLoading: boolean;
    isError: boolean;
    space: SpaceDetails | undefined;
    containerRef: Ref<HTMLDivElement>;
    handle: GameEngineHandle | null;
};

function Content({
    isDuplicateSession,
    isLoading,
    isError,
    space,
    containerRef,
    handle,
}: ContentProps) {
    if (isDuplicateSession) return <SpaceDuplicateSessionState />;
    if (isLoading) return <SpaceLoadingState />;
    if (isError) return <SpaceErrorState />;
    if (!space) return <SpaceNotFoundState />;
    return (
        <>
            <GameCanvas ref={containerRef} />
            <GameControls handle={handle} />
        </>
    );
}

export function SpacePage({ spaceId }: { spaceId: string }) {
    return (
        <SocketProvider>
            <SpacePageContent spaceId={spaceId} />
        </SocketProvider>
    );
}

function SpacePageContent({ spaceId }: { spaceId: string }) {
    const { isDuplicateSession } = useSocket();
    const { open, setOpen } = useSpacePageSidebarState();

    const organizationId = useOrganization().organization?.id ?? "";
    const { user } = useAuth();

    const { space, isLoading, isError } = SpacesQueries.useDetails(
        organizationId,
        spaceId
    );

    const { containerRef, handle } = useGameEngine(
        space?.map ?? null,
        open ? SIDEBAR_WIDTH_PX / 2 : 0
    );

    useSpaceConnection({
        organizationId,
        spaceId,
        userId: user.id,
        game: handle?.game ?? null,
    });

    return (
        <SidebarProvider open={open} onOpenChange={setOpen}>
            <SpacePageRoot>
                <LayoutPrimitive.Header />
                <LayoutPrimitive.Body>
                    <LayoutPrimitive.Content>
                        <Content
                            isDuplicateSession={isDuplicateSession}
                            isLoading={isLoading}
                            isError={isError}
                            space={space}
                            containerRef={containerRef}
                            handle={handle}
                        />
                    </LayoutPrimitive.Content>
                    <LayoutPrimitive.Sidebar />
                </LayoutPrimitive.Body>
                <LayoutPrimitive.Controls>
                    <LayoutPrimitive.ControlGroup className="w-full max-w-96 justify-start">
                        <Logo />
                        <Separator
                            orientation="vertical"
                            className="h-5 my-auto"
                        />
                        <UserWidget />
                    </LayoutPrimitive.ControlGroup>
                    <LayoutPrimitive.ControlGroup className="w-full max-w-96">
                        <MicToggleButton />
                        <CameraToggleButton />
                    </LayoutPrimitive.ControlGroup>
                    <LayoutPrimitive.ControlGroup className="w-full max-w-96 justify-end">
                        <SpaceSidebar.Trigger />
                        <LeaveSpaceButton />
                    </LayoutPrimitive.ControlGroup>
                </LayoutPrimitive.Controls>
            </SpacePageRoot>
        </SidebarProvider>
    );
}
