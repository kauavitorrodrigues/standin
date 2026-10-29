// A key in a library file that points at nothing: the field it was written in
// (`stamp.palette[1].tilesetKey`) and the key itself.
export type LibrarySeedReference = {
    field: string;
    key: string;
};

// One problem of an entry that failed in a service, in the shape the services
// report them.
export type LibrarySeedIssue = {
    code: string;
    path: string;
    message: string;
};
