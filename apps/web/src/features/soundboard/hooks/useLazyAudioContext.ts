import { useCallback, useEffect, useRef } from "react";

/** One AudioContext for a screen of the soundboard, made when first needed and closed with it. */
export const useLazyAudioContext = () => {
    const contextRef = useRef<AudioContext | null>(null);

    const getContext = useCallback((): AudioContext => {
        contextRef.current ??= new AudioContext();
        return contextRef.current;
    }, []);

    useEffect(
        () => () => {
            void contextRef.current?.close().catch(() => undefined);
            contextRef.current = null;
        },
        []
    );

    return getContext;
};
