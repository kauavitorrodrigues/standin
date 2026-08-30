import { UploadIcon, XIcon } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemPreview,
    FileUploadItemDelete,
} from "@/components/ui/file-upload";

type Props = {
    id: string;
    label: string;
    required?: boolean;
    placeholder: string;
    value: File[];
    onValueChange: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    disabled?: boolean;
    error?: string;
    renderPreview?: (file: File) => React.ReactNode;
    hideDropzoneWhenFilled?: boolean;
};

export const FileUploadFormField = ({
    id,
    label,
    required,
    placeholder,
    value,
    onValueChange,
    accept,
    multiple,
    maxFiles,
    disabled,
    error,
    renderPreview,
    hideDropzoneWhenFilled,
}: Props) => {
    const showDropzone = !hideDropzoneWhenFilled || value.length === 0;

    return (
        <Field data-invalid={!!error}>
            <FieldLabel htmlFor={id}>
                {label} {required && <span aria-hidden>*</span>}
            </FieldLabel>
            <FileUpload
                id={id}
                value={value}
                onValueChange={onValueChange}
                accept={accept}
                multiple={multiple}
                maxFiles={maxFiles}
                disabled={disabled}
            >
                {showDropzone && (
                    <FileUploadDropzone>
                        <UploadIcon className="size-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground text-center">
                            {placeholder}
                        </p>
                    </FileUploadDropzone>
                )}
                <div role="list" className="flex flex-col gap-2">
                    {value.map((file) => (
                        <FileUploadItem
                            key={`${file.name}-${file.lastModified}`}
                            value={file}
                        >
                            <FileUploadItemPreview render={renderPreview} />
                            <div className="min-w-0 flex-1 truncate text-sm">
                                {file.name}
                            </div>
                            <FileUploadItemDelete
                                render={
                                    <Button variant="ghost" size="icon-sm">
                                        <XIcon />
                                    </Button>
                                }
                            />
                        </FileUploadItem>
                    ))}
                </div>
            </FileUpload>
            <FieldError errors={error ? [{ message: error }] : []} />
        </Field>
    );
};
