// A piece of message content: plain text, or a mention with the label that
// was typed (`@Name`, the @ included) and the id of the person.
export type MentionPart =
    | { type: "text"; text: string }
    | { type: "mention"; userId: string; label: string };
