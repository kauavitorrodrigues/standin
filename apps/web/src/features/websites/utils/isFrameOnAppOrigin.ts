// Whether the page in the frame is on the origin of the app. A page of another
// origin hides its location and the read throws, which is the answer wanted.
export const isFrameOnAppOrigin = (
    frame: Pick<HTMLIFrameElement, "contentWindow">,
    appOrigin: string
): boolean => {
    try {
        return frame.contentWindow?.location.origin === appOrigin;
    } catch {
        return false;
    }
};
