import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type VideoElementProps = {
    stream: MediaStream;
    mirrored?: boolean;
    className?: string;
};

// Always muted: these streams carry video only (voice has its own path, see
// RemoteAudioManager), and a muted element is also allowed to autoplay
// without a user gesture.
export const VideoElement = ({
    stream,
    mirrored = false,
    className,
}: VideoElementProps) => {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        element.srcObject = stream;
        return () => {
            element.srcObject = null;
        };
    }, [stream]);

    return (
        <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className={cn(
                "size-full object-contain",
                mirrored && "-scale-x-100",
                className
            )}
        />
    );
};
