import { UploadedImageSummary } from "./UploadedImageSummary";

type Props = {
    file: File | undefined;
    frameCount: number;
};

// What the server will read from the new PNG, once there is one.
export const ReplaceImageSummary = ({ file, frameCount }: Props) => {
    if (!file) return null;
    return <UploadedImageSummary file={file} frameCount={frameCount} />;
};
