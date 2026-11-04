import { ANNOUNCING_BANNER_TEXTS } from "../consts/announcingBanner";

export const resolveVideoButtonText = (isSharingVideo: boolean): string => {
    if (isSharingVideo) return ANNOUNCING_BANNER_TEXTS.stopShareVideoButton;
    return ANNOUNCING_BANNER_TEXTS.shareVideoButton;
};
