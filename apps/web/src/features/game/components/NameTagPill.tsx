import type { CSSProperties } from "react";
import { NAME_TAG } from "@/features/game/consts/name-tag";
import { truncateName } from "@/features/game/utils/truncateName";
import { UserAvatar } from "@/features/users/components/UserAvatar";

export type NameTagPillProps = {
    name: string;
    // The tag of the local player has its own color.
    isLocal: boolean;
    // The tag was clicked: the photo of the person takes the place of the dot
    // and the tag glows.
    isDetailed: boolean;
    userId: string;
    // The photo of the profile. Without one the photo is the initial.
    avatarUrl: string | null;
};

const getBackgroundColor = (isLocal: boolean): string =>
    isLocal ? NAME_TAG.LOCAL_BACKGROUND_COLOR : NAME_TAG.BACKGROUND_COLOR;

// The box with the status and the name, and the small tail under it that points
// at the avatar. It has no position: the game places it over an avatar
// (`NameTag`) and the avatar lab places it by hand. The styles are inline so
// the tag looks the same wherever it is mounted.
export const NameTagPill = ({
    name,
    isLocal,
    isDetailed,
    userId,
    avatarUrl,
}: NameTagPillProps) => {
    const backgroundColor = getBackgroundColor(isLocal);
    const boxStyle: CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        minHeight: NAME_TAG.HEIGHT,
        padding: `${NAME_TAG.PADDING_Y}px ${NAME_TAG.PADDING_X}px`,
        gap: NAME_TAG.GAP,
        borderRadius: NAME_TAG.RADIUS,
        backgroundColor,
        color: NAME_TAG.TEXT_COLOR,
        fontFamily: '"Inter Variable", Inter, system-ui, sans-serif',
        fontSize: NAME_TAG.FONT_SIZE,
        fontWeight: NAME_TAG.FONT_WEIGHT,
        lineHeight: `${NAME_TAG.LINE_HEIGHT}px`,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        userSelect: "none",
        ...(isDetailed && { boxShadow: NAME_TAG.SELECTED_SHADOW }),
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pointerEvents: "none",
            }}
        >
            <div style={boxStyle}>
                {isDetailed ? (
                    <NameTagPhoto
                        userId={userId}
                        name={name}
                        avatarUrl={avatarUrl}
                        ringColor={backgroundColor}
                    />
                ) : (
                    <span
                        style={{
                            flexShrink: 0,
                            width: NAME_TAG.DOT_SIZE,
                            height: NAME_TAG.DOT_SIZE,
                            borderRadius: "50%",
                            backgroundColor: NAME_TAG.DOT_COLOR,
                            marginLeft: NAME_TAG.DOT_OFFSET_X,
                            marginRight: -NAME_TAG.DOT_OFFSET_X,
                        }}
                    />
                )}
                <span
                    title={name}
                    style={{
                        position: "relative",
                        top: NAME_TAG.TEXT_OFFSET_Y,
                    }}
                >
                    {truncateName(name)}
                </span>
            </div>
            <div
                style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${NAME_TAG.TAIL_WIDTH / 2}px solid transparent`,
                    borderRight: `${NAME_TAG.TAIL_WIDTH / 2}px solid transparent`,
                    borderTop: `${NAME_TAG.TAIL_HEIGHT}px solid ${backgroundColor}`,
                }}
            />
        </div>
    );
};

type NameTagPhotoProps = {
    userId: string;
    name: string;
    avatarUrl: string | null;
    // The ring that cuts the online badge out of the photo.
    ringColor: string;
};

// The photo of the person with the small online badge on its corner.
const NameTagPhoto = ({
    userId,
    name,
    avatarUrl,
    ringColor,
}: NameTagPhotoProps) => (
    <span
        style={{
            position: "relative",
            display: "flex",
            flexShrink: 0,
            width: NAME_TAG.PHOTO_SIZE,
            height: NAME_TAG.PHOTO_SIZE,
        }}
    >
        <UserAvatar id={userId} name={name} avatar={avatarUrl} size="xs" />
        <span
            style={{
                position: "absolute",
                right: -2,
                bottom: -2,
                width: NAME_TAG.PHOTO_BADGE_SIZE,
                height: NAME_TAG.PHOTO_BADGE_SIZE,
                boxSizing: "content-box",
                borderRadius: "50%",
                backgroundColor: NAME_TAG.DOT_COLOR,
                border: `1px solid ${ringColor}`,
            }}
        />
    </span>
);
