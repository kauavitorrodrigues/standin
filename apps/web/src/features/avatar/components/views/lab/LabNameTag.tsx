import { AVATAR } from "@standin/contracts";
import { NAME_TAG } from "@/features/game/consts/name-tag";
import { LAB_DEPTH } from "../../../consts/lab";

type Props = {
    isVisible: boolean;
    name: string;
    x: number;
    feetY: number;
};

// The name tag as the game draws it: a dark pill with a green dot, with its
// bottom at `AVATAR.nameTagGap` over the visible top of the avatar.
export const LabNameTag = ({ isVisible, name, x, feetY }: Props) => {
    if (!isVisible) return null;

    return (
        <div
            className="pointer-events-none absolute flex -translate-x-1/2 items-center whitespace-nowrap bg-gray-900/85 text-white"
            style={{
                left: x,
                top:
                    feetY -
                    AVATAR.visible.h -
                    AVATAR.nameTagGap -
                    NAME_TAG.HEIGHT,
                height: NAME_TAG.HEIGHT,
                paddingInline: NAME_TAG.PADDING_X,
                gap: NAME_TAG.DOT_GAP,
                borderRadius: NAME_TAG.RADIUS,
                fontSize: NAME_TAG.FONT_SIZE,
                zIndex: LAB_DEPTH.GUIDES,
            }}
        >
            <span
                className="shrink-0 rounded-full bg-green-500"
                style={{
                    width: NAME_TAG.DOT_RADIUS * 2,
                    height: NAME_TAG.DOT_RADIUS * 2,
                }}
            />
            {name}
        </div>
    );
};
