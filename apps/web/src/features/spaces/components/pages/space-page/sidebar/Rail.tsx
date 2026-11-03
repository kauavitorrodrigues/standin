import { useState, type ReactNode } from "react";
import {
    BellIcon,
    OrbitIcon,
    MessageCircleIcon,
    SearchIcon,
    SettingsIcon,
    UsersIcon,
} from "lucide-react";
import type { SpaceDetails } from "@standin/contracts";
import { CountBadge } from "@/components/ui/count-badge";
import { DecorateMenuItem } from "@/features/decorator/components/instances/DecorateMenuItem";
import type { DecorateAvailability } from "@/features/decorator/types/decorate-availability";
import { EditMapMenuItem } from "@/features/maps/organizations/components/instances/EditMapMenuItem";
import { ChatQueries } from "@/features/chat/queries";
import { SoundboardManagerDialog } from "@/features/soundboard/components/dialogs/ManagerDialog";
import { SoundboardMenuItem } from "@/features/soundboard/components/instances/SoundboardMenuItem";
import { SettingsDialog } from "@/features/settings/components/dialogs/SettingsDialog";
import { RailButton } from "@/features/spaces/components/pages/space-page/sidebar/RailButton";
import { InviteCollaboratorsDialog } from "@/features/invites/components/dialogs/InviteCollaboratorsDialog";
import { InviteMenuItem } from "@/features/invites/components/instances/InviteMenuItem";
import type { ManageTarget } from "@/features/invites/types";
import { usePermission } from "@/features/auth/hooks/usePermission";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import type { SettingsSectionId } from "@/features/settings/consts/sections";
import { SpaceSettingsDialog } from "@/features/spaces/settings/components/instances/SpaceSettingsDialog";
import { SpaceSettingsMenuItem } from "@/features/spaces/settings/components/instances/SpaceSettingsMenuItem";
import { SpaceMenu } from "@/features/spaces/components/pages/space-page/sidebar/SpaceMenu";
import { SPACE_VIEWS, type SpaceView } from "@/features/spaces/consts/view";

type Props = {
    space: SpaceDetails;
    view: SpaceView;
    onSelectView: (view: SpaceView) => void;
    isPeopleOpen: boolean;
    onTogglePeople: () => void;
    // Opens the decorator with no focus, from the space menu.
    onDecorate: () => void;
    decorateAvailability: DecorateAvailability;
};

type FrameProps = { children: ReactNode };

export const RailFrame = ({ children }: FrameProps) => (
    <nav className="absolute inset-y-0 left-0 z-30 flex w-(--rail-width) flex-col items-center gap-2 bg-background py-1.5">
        {children}
    </nav>
);

// Always on the left and never expands. Office and chat switch what covers
// the screen; search, notifications and settings have no action yet.
export const Rail = ({
    space,
    view,
    onSelectView,
    isPeopleOpen,
    onTogglePeople,
    onDecorate,
    decorateAvailability,
}: Props) => {
    const { total: unreadTotal } = ChatQueries.useUnreadCounts();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    // The section the settings open on: the people of the space when the invite
    // dialog sends there, the first one otherwise.
    const [settingsSection, setSettingsSection] = useState<
        SettingsSectionId | undefined
    >(undefined);
    const organizationId = useOrganizationId();
    const canInvite = usePermission("update", "space");

    const openSettings = (section?: SettingsSectionId) => {
        setSettingsSection(section);
        setIsSettingsOpen(true);
    };
    const manage = (target: ManageTarget) => openSettings(target);
    const [isSpaceSettingsOpen, setIsSpaceSettingsOpen] = useState(false);
    const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);

    return (
        <RailFrame>
            <SpaceMenu>
                <DecorateMenuItem
                    availability={decorateAvailability}
                    onDecorate={onDecorate}
                />
                <EditMapMenuItem spaceId={space.id} mapId={space.map.id} />
                {canInvite && (
                    <InviteMenuItem onOpen={() => setIsInviteOpen(true)} />
                )}
                <SoundboardMenuItem onOpen={() => setIsSoundboardOpen(true)} />
                <SpaceSettingsMenuItem
                    onOpen={() => setIsSpaceSettingsOpen(true)}
                />
            </SpaceMenu>
            <RailButton icon={SearchIcon} label="Buscar" disabled />
            <RailButton
                icon={OrbitIcon}
                label="Espaço"
                active={view === SPACE_VIEWS.SPACE && !isPeopleOpen}
                onClick={
                    isPeopleOpen
                        ? onTogglePeople
                        : () => onSelectView(SPACE_VIEWS.SPACE)
                }
            />
            <RailButton
                icon={UsersIcon}
                label="Pessoas"
                active={isPeopleOpen}
                onClick={onTogglePeople}
            />
            <RailButton
                icon={MessageCircleIcon}
                label="Chat"
                active={view === SPACE_VIEWS.CHAT}
                onClick={() => onSelectView(SPACE_VIEWS.CHAT)}
                badge={<CountBadge count={unreadTotal} />}
            />
            <RailButton icon={BellIcon} label="Notificações" disabled />
            <RailButton
                icon={SettingsIcon}
                label="Configurações"
                onClick={() => openSettings()}
                className="mt-auto"
            />
            <SoundboardManagerDialog
                open={isSoundboardOpen}
                onOpenChange={setIsSoundboardOpen}
            />
            <SpaceSettingsDialog
                spaceId={space.id}
                open={isSpaceSettingsOpen}
                onOpenChange={setIsSpaceSettingsOpen}
            />
            <SettingsDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                initialSection={settingsSection}
                space={{
                    organizationId,
                    spaceId: space.id,
                    canInvite,
                    onInvite: () => {
                        setIsSettingsOpen(false);
                        setIsInviteOpen(true);
                    },
                }}
            />
            <InviteCollaboratorsDialog
                organizationId={organizationId}
                spaceId={space.id}
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                onManage={manage}
            />
        </RailFrame>
    );
};
