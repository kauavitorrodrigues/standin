import { useMemo } from "react";

// A URL the browser can show for a local file. The file is the only input, so
// the URL lives as long as the file does.
export const useObjectUrl = (file: File | undefined) =>
    useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file]);
