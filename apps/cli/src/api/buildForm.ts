import type { ApiForm } from "../types";

// The multipart body of a call. The part names are not touched: the library
// seed names each PNG by the path written in library.json.
export const buildForm = (form: ApiForm): FormData => {
    const data: FormData = new FormData();
    for (const [name, value] of Object.entries(form.fields)) {
        data.append(name, value);
    }
    for (const file of form.files) {
        const blob: Blob = new Blob([file.bytes as BlobPart], {
            type: file.type,
        });
        data.append(file.name, blob, file.fileName);
    }
    return data;
};
