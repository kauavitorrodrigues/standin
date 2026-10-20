import { UploadIcon, XIcon } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FieldHint } from "./FieldHint";
import { LargeFileUploadItem } from "./LargeFileUploadItem";
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
    hint?: string;
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
    compact?: boolean;
    // Swaps the dropzone for the chosen image alone, big and centered.
    largePreview?: boolean;
    dropzoneClassName?: string;
    className?: string;
};

export const FileUploadFormField = ({
    id,
    label,
    required,
    hint,
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
    compact,
    largePreview,
    dropzoneClassName,
    className,
}: Props) => {
    const hideWhenFilled = hideDropzoneWhenFilled || largePreview;
    const showDropzone = !hideWhenFilled || value.length === 0;

    return (
        <Field data-invalid={!!error} className={className}>
            <div className="flex items-center gap-1.5">
                <FieldLabel htmlFor={id} className="w-auto">
                    {label} {required && <span aria-hidden>*</span>}
                </FieldLabel>
                {hint && <FieldHint>{hint}</FieldHint>}
            </div>
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
                    <FileUploadDropzone
                        className={cn(
                            compact && "min-h-16 flex-row gap-2 p-3",
                            dropzoneClassName
                        )}
                    >
                        <UploadIcon
                            className={cn(
                                "size-6 text-muted-foreground",
                                compact && "size-4 shrink-0"
                            )}
                        />
                        <p
                            className={cn(
                                "text-sm text-muted-foreground text-center",
                                compact && "text-xs"
                            )}
                        >
                            {placeholder}
                        </p>
                    </FileUploadDropzone>
                )}
                <div role="list" className="flex flex-col gap-2">
                    {value.map((file) => {
                        if (largePreview) {
                            return (
                                <LargeFileUploadItem
                                    key={`${file.name}-${file.lastModified}`}
                                    file={file}
                                />
                            );
                        }
                        return (
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
                        );
                    })}
                </div>
            </FileUpload>
            <FieldError errors={error ? [{ message: error }] : []} />
        </Field>
    );
};
