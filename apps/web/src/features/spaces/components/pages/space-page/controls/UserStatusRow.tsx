import { UserStatusPanel } from "@/features/users/components/views/UserStatusPanel";
import { ControlsRow } from "./ControlsRow";

type Props = { isOpen: boolean };

// The status card as a row of the control card, so it grows out of the same
// card instead of floating over the map.
export const UserStatusRow = ({ isOpen }: Props) => (
    <ControlsRow isOpen={isOpen}>
        <UserStatusPanel />
    </ControlsRow>
);
