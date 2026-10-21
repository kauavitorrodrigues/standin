import { useEffect, useState } from "react";

type ObjectUrl = { file: File; url: string };

// A URL the browser can show for a local file. It is made after the render and
// revoked when the file changes or the component goes away, so blob URLs do
// not pile up. It is undefined until it is made, and never the URL of a
// previous file.
export const useObjectUrl = (file: File | undefined): string | undefined => {
    const [current, setCurrent] = useState<ObjectUrl | undefined>();

    useEffect(() => {
        if (!file) return;

        const url = URL.createObjectURL(file);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is an external resource made here, so the state follows it
        setCurrent({ file, url });

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return current?.file === file ? current?.url : undefined;
};
