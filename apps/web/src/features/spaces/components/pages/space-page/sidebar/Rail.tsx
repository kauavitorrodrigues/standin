import { useState, type ReactNode } from "react";
import {
    BellIcon,
    OrbitIcon,
    MessageCircleIcon,
    SearchIcon,
    SettingsIcon,
    UsersIcon,
} from "lucide-react";
import { CountBadge } from "@/components/ui/count-badge";
import { ChatQueries } from "@/features/chat/queries";
import { SettingsDialog } from "@/features/settings/components/dialogs/SettingsDialog";
import { RailButton } from "@/features/spaces/components/pages/space-page/sidebar/RailButton";
import { SpaceMenu } from "@/features/spaces/components/pages/space-page/sidebar/SpaceMenu";
import { SPACE_VIEWS, type SpaceView } from "@/features/spaces/consts/view";

type Props = {
    view: SpaceView;
    onSelectView: (view: SpaceView) => void;
    isPeopleOpen: boolean;
    onTogglePeople: () => void;
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
    view,
    onSelectView,
    isPeopleOpen,
    onTogglePeople,
}: Props) => {
    const { total: unreadTotal } = ChatQueries.useUnreadCounts();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <RailFrame>
            <SpaceMenu />
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
                onClick={() => setIsSettingsOpen(true)}
                className="mt-auto"
            />
            <SettingsDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
            />
        </RailFrame>
    );
};
