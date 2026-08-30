import { cn } from "@/lib/utils";
import { useAsRef } from "@/hooks/useAsRef";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
    FileArchiveIcon,
    FileAudioIcon,
    FileCodeIcon,
    FileCogIcon,
    FileIcon,
    FileTextIcon,
    FileVideoIcon,
} from "lucide-react";
import * as React from "react";

const ROOT_NAME = "FileUpload";
const DROPZONE_NAME = "FileUploadDropzone";
const TRIGGER_NAME = "FileUploadTrigger";
const LIST_NAME = "FileUploadList";
const ITEM_NAME = "FileUploadItem";
const ITEM_PREVIEW_NAME = "FileUploadItemPreview";
const ITEM_METADATA_NAME = "FileUploadItemMetadata";
const ITEM_PROGRESS_NAME = "FileUploadItemProgress";
const ITEM_DELETE_NAME = "FileUploadItemDelete";
const CLEAR_NAME = "FileUploadClear";

const FILE_UPLOAD_ERRORS = {
    [ROOT_NAME]: `\`${ROOT_NAME}\` must be used as root component`,
    [DROPZONE_NAME]: `\`${DROPZONE_NAME}\` must be within \`${ROOT_NAME}\``,
    [TRIGGER_NAME]: `\`${TRIGGER_NAME}\` must be within \`${ROOT_NAME}\``,
    [LIST_NAME]: `\`${LIST_NAME}\` must be within \`${ROOT_NAME}\``,
    [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
    [ITEM_PREVIEW_NAME]: `\`${ITEM_PREVIEW_NAME}\` must be within \`${ITEM_NAME}\``,
    [ITEM_METADATA_NAME]: `\`${ITEM_METADATA_NAME}\` must be within \`${ITEM_NAME}\``,
    [ITEM_PROGRESS_NAME]: `\`${ITEM_PROGRESS_NAME}\` must be within \`${ITEM_NAME}\``,
    [ITEM_DELETE_NAME]: `\`${ITEM_DELETE_NAME}\` must be within \`${ITEM_NAME}\``,
    [CLEAR_NAME]: `\`${CLEAR_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

function useLazyRef<T>(fn: () => T) {
    const ref = React.useRef<T | null>(null);
    if (ref.current === null) {
        ref.current = fn();
    }
    return ref as React.RefObject<T>;
}

type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
    const contextDir = React.useContext(DirectionContext);
    return dirProp ?? contextDir ?? "ltr";
}

interface FileState {
    file: File;
    progress: number;
    error?: string;
    status: "idle" | "uploading" | "error" | "success";
}

interface StoreState {
    files: Map<File, FileState>;
    dragOver: boolean;
    invalid: boolean;
}

type StoreAction =
    | { variant: "ADD_FILES"; files: File[] }
    | { variant: "SET_FILES"; files: File[] }
    | { variant: "SET_PROGRESS"; file: File; progress: number }
    | { variant: "SET_SUCCESS"; file: File }
    | { variant: "SET_ERROR"; file: File; error: string }
    | { variant: "REMOVE_FILE"; file: File }
    | { variant: "SET_DRAG_OVER"; dragOver: boolean }
    | { variant: "SET_INVALID"; invalid: boolean }
    | { variant: "CLEAR" };

function createStore(
    listeners: Set<() => void>,
    files: Map<File, FileState>,
    onValueChange?: (files: File[]) => void,
    invalid?: boolean
) {
    const initialState: StoreState = {
        files,
        dragOver: false,
        invalid: invalid ?? false,
    };
    let state = initialState;

    function reducer(state: StoreState, action: StoreAction): StoreState {
        switch (action.variant) {
        case "ADD_FILES": {
            for (const file of action.files) {
                files.set(file, { file, progress: 0, status: "idle" });
            }
            if (onValueChange)
                onValueChange(
                    Array.from(files.values()).map((f) => f.file)
                );
            return { ...state, files };
        }
        case "SET_FILES": {
            const newFileSet = new Set(action.files);
            for (const existing of files.keys()) {
                if (!newFileSet.has(existing)) files.delete(existing);
            }
            for (const file of action.files) {
                if (!files.get(file))
                    files.set(file, { file, progress: 0, status: "idle" });
            }
            return { ...state, files };
        }
        case "SET_PROGRESS": {
            const fs = files.get(action.file);
            if (fs)
                files.set(action.file, {
                    ...fs,
                    progress: action.progress,
                    status: "uploading",
                });
            return { ...state, files };
        }
        case "SET_SUCCESS": {
            const fs = files.get(action.file);
            if (fs)
                files.set(action.file, {
                    ...fs,
                    progress: 100,
                    status: "success",
                });
            return { ...state, files };
        }
        case "SET_ERROR": {
            const fs = files.get(action.file);
            if (fs)
                files.set(action.file, {
                    ...fs,
                    error: action.error,
                    status: "error",
                });
            return { ...state, files };
        }
        case "REMOVE_FILE": {
            files.delete(action.file);
            if (onValueChange)
                onValueChange(
                    Array.from(files.values()).map((f) => f.file)
                );
            return { ...state, files };
        }
        case "SET_DRAG_OVER":
            return { ...state, dragOver: action.dragOver };
        case "SET_INVALID":
            return { ...state, invalid: action.invalid };
        case "CLEAR": {
            files.clear();
            if (onValueChange) onValueChange([]);
            return { ...state, files, invalid: false };
        }
        default:
            return state;
        }
    }

    function getState() {
        return state;
    }
    function dispatch(action: StoreAction) {
        state = reducer(state, action);
        for (const l of listeners) l();
    }
    function subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    return { getState, dispatch, subscribe };
}

const StoreContext = React.createContext<ReturnType<typeof createStore> | null>(
    null
);
StoreContext.displayName = ROOT_NAME;

function useStoreContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
    const ctx = React.useContext(StoreContext);
    if (!ctx) throw new Error(FILE_UPLOAD_ERRORS[name]);
    return ctx;
}

function useStore<T>(selector: (state: StoreState) => T): T {
    const store = useStoreContext(ROOT_NAME);
    const lastValueRef = useLazyRef<{ value: T; state: StoreState } | null>(
        () => null
    );
    const getSnapshot = React.useCallback(() => {
        const state = store.getState();
        const prev = lastValueRef.current;
        if (prev && prev.state === state) return prev.value;
        const next = selector(state);
        lastValueRef.current = { value: next, state };
        return next;
    }, [store, selector, lastValueRef]);
    return React.useSyncExternalStore(
        store.subscribe,
        getSnapshot,
        getSnapshot
    );
}

interface FileUploadContextValue {
    inputId: string;
    dropzoneId: string;
    listId: string;
    labelId: string;
    disabled: boolean;
    dir: Direction;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(
    null
);

function useFileUploadContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
    const ctx = React.useContext(FileUploadContext);
    if (!ctx) throw new Error(FILE_UPLOAD_ERRORS[name]);
    return ctx;
}

interface FileUploadRootProps extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    "defaultValue" | "onChange"
> {
    value?: File[];
    defaultValue?: File[];
    onValueChange?: (files: File[]) => void;
    onAccept?: (files: File[]) => void;
    onFileAccept?: (file: File) => void;
    onFileReject?: (file: File, message: string) => void;
    onFileValidate?: (file: File) => string | null | undefined;
    onUpload?: (
        files: File[],
        options: {
            onProgress: (file: File, progress: number) => void;
            onSuccess: (file: File) => void;
            onError: (file: File, error: Error) => void;
        }
    ) => Promise<void> | void;
    accept?: string;
    maxFiles?: number;
    maxSize?: number;
    dir?: Direction;
    label?: string;
    name?: string;
    render?: useRender.ComponentProps<"div">["render"];
    disabled?: boolean;
    invalid?: boolean;
    multiple?: boolean;
    required?: boolean;
}

const FileUploadRoot = React.forwardRef<HTMLDivElement, FileUploadRootProps>(
    (props, forwardedRef) => {
        const {
            value,
            defaultValue,
            onValueChange,
            onAccept,
            onFileAccept,
            onFileReject,
            onFileValidate,
            onUpload,
            accept,
            maxFiles,
            maxSize,
            dir: dirProp,
            label,
            name,
            render,
            disabled = false,
            invalid = false,
            multiple = false,
            required = false,
            children,
            className,
            ...rootProps
        } = props;

        const inputId = React.useId();
        const dropzoneId = React.useId();
        const listId = React.useId();
        const labelId = React.useId();
        const dir = useDirection(dirProp);
        const propsRef = useAsRef(props);
        const listeners = useLazyRef(() => new Set<() => void>()).current;
        const files = useLazyRef<Map<File, FileState>>(() => new Map()).current;
        const inputRef = React.useRef<HTMLInputElement>(null);
        const isControlled = value !== undefined;

        const store = React.useMemo(
            () => createStore(listeners, files, onValueChange, invalid),
            [listeners, files, onValueChange, invalid]
        );

        const contextValue = React.useMemo<FileUploadContextValue>(
            () => ({
                dropzoneId,
                inputId,
                listId,
                labelId,
                dir,
                disabled,
                inputRef,
            }),
            [dropzoneId, inputId, listId, labelId, dir, disabled]
        );

        React.useEffect(() => {
            if (isControlled)
                store.dispatch({ variant: "SET_FILES", files: value });
            else if (
                defaultValue &&
                defaultValue.length > 0 &&
                !store.getState().files.size
            )
                store.dispatch({ variant: "SET_FILES", files: defaultValue });
        }, [value, defaultValue, isControlled, store]);

        const onFilesUpload = React.useCallback(
            async (files: File[]) => {
                try {
                    for (const file of files)
                        store.dispatch({
                            variant: "SET_PROGRESS",
                            file,
                            progress: 0,
                        });
                    if (propsRef.current.onUpload) {
                        await propsRef.current.onUpload(files, {
                            onProgress: (file, progress) =>
                                store.dispatch({
                                    variant: "SET_PROGRESS",
                                    file,
                                    progress: Math.min(
                                        Math.max(0, progress),
                                        100
                                    ),
                                }),
                            onSuccess: (file) =>
                                store.dispatch({
                                    variant: "SET_SUCCESS",
                                    file,
                                }),
                            onError: (file, error) =>
                                store.dispatch({
                                    variant: "SET_ERROR",
                                    file,
                                    error: error.message ?? "Upload failed",
                                }),
                        });
                    } else {
                        for (const file of files)
                            store.dispatch({ variant: "SET_SUCCESS", file });
                    }
                } catch (error) {
                    const msg =
                        error instanceof Error
                            ? error.message
                            : "Upload failed";
                    for (const file of files)
                        store.dispatch({
                            variant: "SET_ERROR",
                            file,
                            error: msg,
                        });
                }
            },
            [store, propsRef]
        );

        const onFilesChange = React.useCallback(
            (originalFiles: File[]) => {
                if (propsRef.current.disabled) return;
                let filesToProcess = [...originalFiles];
                let invalid = false;

                if (propsRef.current.maxFiles) {
                    const remaining = Math.max(
                        0,
                        propsRef.current.maxFiles - store.getState().files.size
                    );
                    if (remaining < filesToProcess.length) {
                        const rejected = filesToProcess.slice(remaining);
                        invalid = true;
                        filesToProcess = filesToProcess.slice(0, remaining);
                        for (const file of rejected)
                            propsRef.current.onFileReject?.(
                                file,
                                `Maximum ${propsRef.current.maxFiles} files allowed`
                            );
                    }
                }

                const accepted: File[] = [];
                for (const file of filesToProcess) {
                    let rejected = false;
                    if (propsRef.current.onFileValidate) {
                        const msg = propsRef.current.onFileValidate(file);
                        if (msg) {
                            propsRef.current.onFileReject?.(file, msg);
                            invalid = true;
                            continue;
                        }
                    }
                    if (propsRef.current.accept) {
                        const types = propsRef.current.accept
                            .split(",")
                            .map((t) => t.trim());
                        const acceptsAll = types.some(
                            (t) => t === "*/*" || t === "*"
                        );
                        const ext = `.${file.name.split(".").pop()}`;
                        if (
                            !acceptsAll &&
                            !types.some(
                                (t) =>
                                    t === file.type ||
                                    t === ext ||
                                    (t.includes("/*") &&
                                        file.type.startsWith(
                                            t.replace("/*", "/")
                                        ))
                            )
                        ) {
                            propsRef.current.onFileReject?.(
                                file,
                                "File type not accepted"
                            );
                            rejected = true;
                            invalid = true;
                        }
                    }
                    if (
                        propsRef.current.maxSize &&
                        file.size > propsRef.current.maxSize
                    ) {
                        propsRef.current.onFileReject?.(file, "File too large");
                        rejected = true;
                        invalid = true;
                    }
                    if (!rejected) accepted.push(file);
                }

                if (invalid) {
                    store.dispatch({ variant: "SET_INVALID", invalid });
                    setTimeout(
                        () =>
                            store.dispatch({
                                variant: "SET_INVALID",
                                invalid: false,
                            }),
                        2000
                    );
                }

                if (accepted.length > 0) {
                    store.dispatch({ variant: "ADD_FILES", files: accepted });
                    propsRef.current.onAccept?.(accepted);
                    for (const file of accepted)
                        propsRef.current.onFileAccept?.(file);
                    if (propsRef.current.onUpload)
                        requestAnimationFrame(() => onFilesUpload(accepted));
                }
            },
            [store, propsRef, onFilesUpload]
        );

        const onInputChange = React.useCallback(
            (event: React.ChangeEvent<HTMLInputElement>) => {
                onFilesChange(Array.from(event.target.files ?? []));
                event.target.value = "";
            },
            [onFilesChange]
        );

        const element = useRender({
            render,
            defaultTagName: "div",
            ref: forwardedRef,
            props: mergeProps<"div">(
                {
                    "data-disabled": disabled ? "" : undefined,
                    "data-slot": "file-upload",
                    dir,
                    className: cn("relative flex flex-col gap-2", className),
                    children: (
                        <>
                            {children}
                            <input
                                type="file"
                                id={inputId}
                                aria-labelledby={labelId}
                                aria-describedby={dropzoneId}
                                ref={inputRef}
                                tabIndex={-1}
                                accept={accept}
                                name={name}
                                disabled={disabled}
                                multiple={multiple}
                                required={required}
                                className="sr-only"
                                onChange={onInputChange}
                            />
                            <span id={labelId} className="sr-only">
                                {label ?? "File upload"}
                            </span>
                        </>
                    ),
                } as React.ComponentPropsWithRef<"div">,
                rootProps
            ),
        });

        return (
            <DirectionContext.Provider value={dir}>
                <StoreContext.Provider value={store}>
                    <FileUploadContext.Provider value={contextValue}>
                        {element}
                    </FileUploadContext.Provider>
                </StoreContext.Provider>
            </DirectionContext.Provider>
        );
    }
);
FileUploadRoot.displayName = ROOT_NAME;

const FileUploadDropzone = React.forwardRef<
    HTMLDivElement,
    useRender.ComponentProps<"div">
>((props, forwardedRef) => {
    const { render, className, ...dropzoneProps } = props;
    const context = useFileUploadContext(DROPZONE_NAME);
    const store = useStoreContext(DROPZONE_NAME);
    const dragOver = useStore((state) => state.dragOver);
    const invalid = useStore((state) => state.invalid);
    const propsRef = useAsRef(dropzoneProps);

    const onClick = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            propsRef.current?.onClick?.(event);
            if (event.defaultPrevented) return;
            const target = event.target;
            const isFromTrigger =
                target instanceof HTMLElement &&
                target.closest('[data-slot="file-upload-trigger"]');
            if (!isFromTrigger) context.inputRef.current?.click();
        },
        [context.inputRef, propsRef]
    );

    const onDragOver = React.useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            propsRef.current?.onDragOver?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            store.dispatch({ variant: "SET_DRAG_OVER", dragOver: true });
        },
        [store, propsRef]
    );

    const onDragEnter = React.useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            propsRef.current?.onDragEnter?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            store.dispatch({ variant: "SET_DRAG_OVER", dragOver: true });
        },
        [store, propsRef]
    );

    const onDragLeave = React.useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            propsRef.current?.onDragLeave?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            store.dispatch({ variant: "SET_DRAG_OVER", dragOver: false });
        },
        [store, propsRef]
    );

    // Setting a native file input's FileList is the only way the DOM allows a
    // drop to be simulated as a change event, so this callback must mutate
    // the input element directly.
    /* eslint-disable react-hooks/immutability */
    const onDrop = React.useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            propsRef.current?.onDrop?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            store.dispatch({ variant: "SET_DRAG_OVER", dragOver: false });
            const files = Array.from(event.dataTransfer.files);
            const inputElement = context.inputRef.current;
            if (!inputElement) return;
            const dt = new DataTransfer();
            for (const file of files) dt.items.add(file);
            inputElement.files = dt.files;
            inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        },
        [store, context.inputRef, propsRef]
    );
    /* eslint-enable react-hooks/immutability */

    const onKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            propsRef.current?.onKeyDown?.(event);
            if (
                !event.defaultPrevented &&
                (event.key === "Enter" || event.key === " ")
            ) {
                event.preventDefault();
                context.inputRef.current?.click();
            }
        },
        [context.inputRef, propsRef]
    );

    return useRender({
        render,
        defaultTagName: "div",
        ref: forwardedRef,
        props: mergeProps<"div">(
            {
                role: "region",
                id: context.dropzoneId,
                "aria-controls": `${context.inputId} ${context.listId}`,
                "aria-disabled": context.disabled,
                "aria-invalid": invalid,
                "data-disabled": context.disabled ? "" : undefined,
                "data-dragging": dragOver ? "" : undefined,
                "data-invalid": invalid ? "" : undefined,
                "data-slot": "file-upload-dropzone",
                dir: context.dir,
                tabIndex: context.disabled ? undefined : 0,
                className: cn(
                    "relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-[disabled]:pointer-events-none data-[dragging]:border-primary data-[invalid]:border-destructive data-[invalid]:ring-destructive/20",
                    className
                ),
                onClick,
                onDragEnter,
                onDragLeave,
                onDragOver,
                onDrop,
                onKeyDown,
            } as React.ComponentPropsWithRef<"div">,
            dropzoneProps
        ),
    });
});
FileUploadDropzone.displayName = DROPZONE_NAME;

const FileUploadTrigger = React.forwardRef<
    HTMLButtonElement,
    useRender.ComponentProps<"button">
>((props, forwardedRef) => {
    const { render, ...triggerProps } = props;
    const context = useFileUploadContext(TRIGGER_NAME);
    const propsRef = useAsRef(triggerProps);
    const onClick = React.useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            propsRef.current?.onClick?.(event);
            if (event.defaultPrevented) return;
            context.inputRef.current?.click();
        },
        [context.inputRef, propsRef]
    );
    return useRender({
        render,
        defaultTagName: "button",
        ref: forwardedRef,
        props: mergeProps<"button">(
            {
                type: "button",
                "aria-controls": context.inputId,
                "data-disabled": context.disabled ? "" : undefined,
                "data-slot": "file-upload-trigger",
                disabled: context.disabled,
                onClick,
            } as React.ComponentPropsWithRef<"button">,
            triggerProps
        ),
    });
});
FileUploadTrigger.displayName = TRIGGER_NAME;

interface FileUploadItemContextValue {
    id: string;
    fileState: FileState | undefined;
    nameId: string;
    sizeId: string;
    statusId: string;
    messageId: string;
}
const FileUploadItemContext =
    React.createContext<FileUploadItemContextValue | null>(null);
function useFileUploadItemContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
    const ctx = React.useContext(FileUploadItemContext);
    if (!ctx) throw new Error(FILE_UPLOAD_ERRORS[name]);
    return ctx;
}

const FileUploadItem = React.forwardRef<
    HTMLDivElement,
    useRender.ComponentProps<"div"> & { value: File }
>((props, forwardedRef) => {
    const { value, render, className, ...itemProps } = props;
    const id = React.useId();
    const statusId = `${id}-status`;
    const nameId = `${id}-name`;
    const sizeId = `${id}-size`;
    const messageId = `${id}-message`;
    const context = useFileUploadContext(ITEM_NAME);
    const fileState = useStore((state) => state.files.get(value));
    const fileCount = useStore((state) => state.files.size);
    const fileIndex = useStore(
        (state) => Array.from(state.files.keys()).indexOf(value) + 1
    );
    const itemContext = React.useMemo(
        () => ({ id, fileState, nameId, sizeId, statusId, messageId }),
        [id, fileState, statusId, nameId, sizeId, messageId]
    );

    const element = useRender({
        render,
        defaultTagName: "div",
        ref: forwardedRef,
        enabled: !!fileState,
        props: mergeProps<"div">(
            {
                role: "listitem",
                id,
                "aria-setsize": fileCount,
                "aria-posinset": fileIndex,
                "aria-describedby": `${nameId} ${sizeId} ${statusId} ${fileState?.error ? messageId : ""}`,
                "aria-labelledby": nameId,
                "data-slot": "file-upload-item",
                dir: context.dir,
                className: cn(
                    "relative flex items-center gap-2.5 rounded-md border p-3 has-[_[data-slot=file-upload-progress]]:flex-col has-[_[data-slot=file-upload-progress]]:items-start",
                    className
                ),
                children: fileState ? (
                    <>
                        {props.children}
                        <span id={statusId} className="sr-only">
                            {fileState.error
                                ? `Error: ${fileState.error}`
                                : fileState.status === "uploading"
                                    ? `Uploading: ${fileState.progress}% complete`
                                    : fileState.status === "success"
                                        ? "Upload complete"
                                        : "Ready to upload"}
                        </span>
                    </>
                ) : null,
            } as React.ComponentPropsWithRef<"div">,
            itemProps
        ),
    });

    if (!fileState) return null;

    return (
        <FileUploadItemContext.Provider value={itemContext}>
            {element}
        </FileUploadItemContext.Provider>
    );
});
FileUploadItem.displayName = ITEM_NAME;

function getFileIcon(file: File) {
    const type = file.type;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (type.startsWith("video/")) return <FileVideoIcon />;
    if (type.startsWith("audio/")) return <FileAudioIcon />;
    if (type.startsWith("text/") || ["txt", "md", "rtf", "pdf"].includes(ext))
        return <FileTextIcon />;
    if (
        [
            "html",
            "css",
            "js",
            "jsx",
            "ts",
            "tsx",
            "json",
            "xml",
            "php",
            "py",
            "rb",
            "java",
            "c",
            "cpp",
            "cs",
        ].includes(ext)
    )
        return <FileCodeIcon />;
    if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext))
        return <FileArchiveIcon />;
    if (
        ["exe", "msi", "app", "apk", "deb", "rpm"].includes(ext) ||
        type.startsWith("application/")
    )
        return <FileCogIcon />;
    return <FileIcon />;
}

const FileUploadItemPreview = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div"> & {
        render?: (file: File) => React.ReactNode;
    }
>((props, forwardedRef) => {
    const { render, children, className, ...previewProps } = props;
    const itemContext = useFileUploadItemContext(ITEM_PREVIEW_NAME);
    const isImage = itemContext.fileState?.file.type.startsWith("image/");
    const onPreviewRender = React.useCallback(
        (file: File) => {
            if (render) return render(file);
            if (isImage)
                return (
                    <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="size-full rounded object-cover"
                        onLoad={(e) => {
                            if (e.target instanceof HTMLImageElement)
                                URL.revokeObjectURL(e.target.src);
                        }}
                    />
                );
            return getFileIcon(file);
        },
        [isImage, render]
    );
    if (!itemContext.fileState) return null;
    return (
        <div
            aria-labelledby={itemContext.nameId}
            data-slot="file-upload-preview"
            {...previewProps}
            ref={forwardedRef}
            className={cn(
                "relative flex size-10 shrink-0 items-center justify-center rounded-md",
                isImage ? "object-cover" : "bg-accent/50 [&>svg]:size-7",
                className
            )}
        >
            {onPreviewRender(itemContext.fileState.file)}
            {children}
        </div>
    );
});
FileUploadItemPreview.displayName = ITEM_PREVIEW_NAME;

const FileUploadItemDelete = React.forwardRef<
    HTMLButtonElement,
    useRender.ComponentProps<"button">
>((props, forwardedRef) => {
    const { render, ...deleteProps } = props;
    const store = useStoreContext(ITEM_DELETE_NAME);
    const itemContext = useFileUploadItemContext(ITEM_DELETE_NAME);
    const propsRef = useAsRef(deleteProps);
    const onClick = React.useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            propsRef.current?.onClick?.(event);
            if (!itemContext.fileState || event.defaultPrevented) return;
            store.dispatch({
                variant: "REMOVE_FILE",
                file: itemContext.fileState.file,
            });
        },
        [store, itemContext.fileState, propsRef]
    );

    return useRender({
        render,
        defaultTagName: "button",
        ref: forwardedRef,
        enabled: !!itemContext.fileState,
        props: mergeProps<"button">(
            {
                type: "button",
                "aria-controls": itemContext.id,
                "aria-describedby": itemContext.nameId,
                "data-slot": "file-upload-item-delete",
                onClick,
            } as React.ComponentPropsWithRef<"button">,
            deleteProps
        ),
    });
});
FileUploadItemDelete.displayName = ITEM_DELETE_NAME;

const FileUpload = FileUploadRoot;

export {
    FileUpload,
    FileUploadDropzone,
    FileUploadTrigger,
    FileUploadItem,
    FileUploadItemPreview,
    FileUploadItemDelete,
};
