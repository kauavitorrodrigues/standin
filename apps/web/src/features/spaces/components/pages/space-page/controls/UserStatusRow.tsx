import { AnimatedCollapse } from "@/components/ui/animated-collapse";
import { UserStatusPanel } from "@/features/users/components/views/UserStatusPanel";

type Props = { isOpen: boolean };

// The status card as a row of the control card, so it grows out of the same
// card instead of floating over the map. It takes the width of the controls
// under it and never makes the card wider.
export const UserStatusRow = ({ isOpen }: Props) => (
    <AnimatedCollapse open={isOpen} className="w-0 min-w-full">
        <UserStatusPanel />
    </AnimatedCollapse>
);
