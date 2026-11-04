// What a toast can carry besides its text. A person shows with their avatar in
// place of the icon.
export type ToastData = {
    avatar?: {
        id: string;
        name: string;
        src: string | null;
    };
};
