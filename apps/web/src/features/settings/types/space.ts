// The space the settings were opened in. Without it the dialog only has the
// preferences of the person.
export type SettingsSpace = {
    organizationId: string;
    spaceId: string;
    // The owner invites and sees the e-mails of the members.
    canInvite: boolean;
    // Who may get the guest link: the owner, or a member when the space lets
    // members invite. Wider than `canInvite`, which also opens the e-mails.
    canInviteGuests: boolean;
    // Opens the invite dialog, from the add button of the lists.
    onInvite: () => void;
};
