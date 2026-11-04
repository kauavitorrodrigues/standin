// A mention is shown and heard whatever the settings of the conversation
// say: the person was asked for by name. Only the master switch of the
// notifications still turns it off (see notifyWhenAway). It has a tag of its
// own, so a later message of the same conversation does not replace it.
export const buildMentionNotification = (
    messageId: string,
    senderName: string,
    body: string | null
) => ({
    title: `${senderName} mencionou você`,
    body: body ?? "Enviou um arquivo",
    tag: `mention:${messageId}`,
    showNotification: true,
    playSound: true,
});
