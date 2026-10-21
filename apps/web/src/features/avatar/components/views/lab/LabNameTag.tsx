import { AVATAR } from "@standin/contracts";
import { NameTagPill } from "@/features/game/components/NameTagPill";
import { NAME_TAG_TOTAL_HEIGHT } from "@/features/game/consts/name-tag";
import { LAB_DEPTH } from "../../../consts/lab";

type Props = {
    isVisible: boolean;
    name: string;
    x: number;
    feetY: number;
};

// The name tag as the game draws it (`NameTagPill`), with the tip of its tail
// at `AVATAR.nameTagGap` over the visible top of the avatar. The lab places it by
// hand, since it has no camera.
export const LabNameTag = ({ isVisible, name, x, feetY }: Props) => {
    if (!isVisible) return null;

    return (
        <div
            className="pointer-events-none absolute -translate-x-1/2"
            style={{
                left: x,
                top:
                    feetY -
                    AVATAR.visible.h -
                    AVATAR.nameTagGap -
                    NAME_TAG_TOTAL_HEIGHT,
                zIndex: LAB_DEPTH.GUIDES,
            }}
        >
            <NameTagPill
                name={name}
                isLocal={false}
                isDetailed={false}
                userId=""
                profilePictureUrl={null}
            />
        </div>
    );
};
