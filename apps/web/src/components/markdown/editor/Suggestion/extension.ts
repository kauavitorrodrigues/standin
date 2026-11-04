import { Extension } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import type {
    SuggestionKeyDownProps,
    SuggestionProps,
} from "@tiptap/suggestion";
import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
    size,
} from "@floating-ui/dom";
import type { VirtualElement } from "@floating-ui/dom";
import ReactDOM from "react-dom/client";
import { createElement, createRef } from "react";
import type {
    SuggestionListHandle,
    SuggestionOptions,
    SuggestionStorage,
} from "./types";

// A list of suggestions next to the caret, opened by a trigger character.
// The list itself is a React component given by the caller, so the editor
// does not know what is being picked (people, commands, ...).
export const createSuggestionExtension = <TItem>(
    options: SuggestionOptions<TItem>
) => {
    return Extension.create<Record<string, never>, SuggestionStorage>({
        name: options.name,
        // Above the submit on Enter, so a list that is open gets the key first.
        priority: 200,

        addStorage() {
            return { root: null, container: null };
        },

        onDestroy() {
            this.storage.root?.unmount();
            this.storage.container?.remove();
            this.storage.root = null;
            this.storage.container = null;
        },

        addProseMirrorPlugins() {
            const storage = this.storage;
            const editorDom = this.editor.view.dom;

            return [
                Suggestion<TItem>({
                    editor: this.editor,
                    char: options.char,
                    allowSpaces: false,
                    startOfLine: false,
                    allowedPrefixes: [" ", "\n"],
                    items: ({ query }) => options.getItems(query),
                    command: ({ editor, range, props }) =>
                        options.command({ editor, range, item: props }),
                    render() {
                        const listRef = createRef<SuggestionListHandle>();
                        let latestProps: SuggestionProps<TItem> | null = null;
                        let stopAutoUpdate: (() => void) | null = null;

                        // Tracks the caret; contextElement lets floating-ui
                        // find the scroll and resize ancestors.
                        const virtualReference: VirtualElement = {
                            getBoundingClientRect: () =>
                                latestProps?.clientRect?.() ?? new DOMRect(),
                            contextElement: editorDom,
                        };

                        const renderList = (props: SuggestionProps<TItem>) => {
                            storage.root?.render(
                                createElement(options.List, {
                                    ref: listRef,
                                    items: props.items,
                                    onSelect: (item: TItem) =>
                                        props.command(item),
                                })
                            );
                        };

                        // Fixed positioning stays right even when a
                        // transformed ancestor (a centered dialog) creates a
                        // new containing block.
                        const updatePosition = async () => {
                            if (!storage.container) return;
                            const { x, y } = await computePosition(
                                virtualReference,
                                storage.container,
                                {
                                    strategy: "fixed",
                                    placement: "top-start",
                                    middleware: [
                                        offset(6),
                                        flip({
                                            fallbackPlacements: [
                                                "bottom-start",
                                            ],
                                        }),
                                        shift({ padding: 8 }),
                                        size({
                                            padding: 8,
                                            apply({ availableHeight }) {
                                                storage.container?.style.setProperty(
                                                    "--suggestion-max-h",
                                                    `${Math.max(160, Math.floor(availableHeight))}px`
                                                );
                                            },
                                        }),
                                    ],
                                }
                            );
                            Object.assign(storage.container.style, {
                                top: `${y}px`,
                                left: `${x}px`,
                                visibility: "visible",
                            });
                        };

                        const teardown = () => {
                            stopAutoUpdate?.();
                            stopAutoUpdate = null;
                            storage.root?.unmount();
                            storage.root = null;
                            storage.container?.remove();
                        };

                        return {
                            onStart(props: SuggestionProps<TItem>) {
                                latestProps = props;

                                if (!storage.container) {
                                    storage.container =
                                        document.createElement("div");
                                    storage.container.style.position = "fixed";
                                    storage.container.style.zIndex =
                                        "2147483647";
                                }
                                // Hidden until the first position is known, so it
                                // never flashes at (0, 0).
                                storage.container.style.visibility = "hidden";
                                storage.root?.unmount();
                                storage.root = ReactDOM.createRoot(
                                    storage.container
                                );
                                (
                                    options.getContainer() ?? document.body
                                ).appendChild(storage.container);

                                renderList(props);
                                stopAutoUpdate = autoUpdate(
                                    virtualReference,
                                    storage.container,
                                    updatePosition
                                );
                            },

                            onUpdate(props: SuggestionProps<TItem>) {
                                latestProps = props;
                                renderList(props);
                                void updatePosition();
                            },

                            onKeyDown({ event }: SuggestionKeyDownProps) {
                                if (event.key === "Escape") {
                                    teardown();
                                    return true;
                                }
                                return (
                                    listRef.current?.onKeyDown(event) ?? false
                                );
                            },

                            onExit() {
                                teardown();
                            },
                        };
                    },
                }),
            ];
        },
    });
};
