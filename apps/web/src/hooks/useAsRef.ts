import { useLayoutEffect, useRef } from "react";

export function useAsRef<T>(data: T) {
    const ref = useRef<T>(data);
    useLayoutEffect(() => {
        ref.current = data;
    });
    return ref;
}
